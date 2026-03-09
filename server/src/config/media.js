import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const trim = (value) => String(value || "").trim();

const cloudinaryConfig = {
  cloudName: trim(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: trim(process.env.CLOUDINARY_API_KEY),
  apiSecret: trim(process.env.CLOUDINARY_API_SECRET),
};

export const isCloudinaryConfigured =
  Boolean(cloudinaryConfig.cloudName) &&
  Boolean(cloudinaryConfig.apiKey) &&
  Boolean(cloudinaryConfig.apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
  });
}

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore local cleanup errors.
  }
};

export const uploadProductImage = async (filePath) => {
  if (!filePath) {
    throw new Error("Image file path is required");
  }

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "campustrade/products",
        resource_type: "image",
      });
      await safeUnlink(filePath);
      return String(result?.secure_url || result?.url || "");
    } catch (error) {
      await safeUnlink(filePath);
      const message = String(error?.message || "");

      if (/invalid\s+api[_-]?key|invalid\s+signature|authentication/i.test(message)) {
        throw new Error("Image upload service is misconfigured. Please contact support.");
      }

      throw new Error("Image upload failed. Please try again.");
    }
  }

  return String(filePath).replace(/\\/g, "/");
};
