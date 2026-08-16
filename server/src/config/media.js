import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const trim = (value) => String(value || "").trim();

const getCloudinaryConfig = () => {
  const cloudinaryConfig = {
    cloudName: trim(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: trim(process.env.CLOUDINARY_API_KEY),
    apiSecret: trim(process.env.CLOUDINARY_API_SECRET),
  };

  const configured =
    Boolean(cloudinaryConfig.cloudName) &&
    Boolean(cloudinaryConfig.apiKey) &&
    Boolean(cloudinaryConfig.apiSecret);

  return { ...cloudinaryConfig, configured };
};

export const hasCloudinaryConfig = () => getCloudinaryConfig().configured;
export const isCloudinaryConfigured = getCloudinaryConfig().configured;

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore local cleanup errors.
  }
};

const getLocalUploadUrl = (filePath) => {
  const fileName = path.basename(filePath || "");
  if (!fileName) return "";
  return `/uploads/${fileName}`;
};

export const uploadProductImage = async (filePath) => {
  if (!filePath) {
    throw new Error("Image file path is required");
  }

  const cloudinaryConfig = getCloudinaryConfig();
  if (!cloudinaryConfig.configured) {
    await safeUnlink(filePath);
    console.error("❌ CLOUDINARY CONFIG ERROR: Missing environment variables");
    console.error("   CLOUDINARY_CLOUD_NAME:", cloudinaryConfig.cloudName ? "set" : "missing");
    console.error("   CLOUDINARY_API_KEY:", cloudinaryConfig.apiKey ? "set" : "missing");
    console.error("   CLOUDINARY_API_SECRET:", cloudinaryConfig.apiSecret ? "set" : "missing");
    throw new Error("Image upload is not configured on the server. Please contact support.");
  }

  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
  });

  try {
    console.log("📤 Uploading image to Cloudinary:", path.basename(filePath));
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "campustrade/products",
      resource_type: "image",
    });

    const uploadedUrl = String(result?.secure_url || result?.url || "").trim();
    if (!uploadedUrl) {
      console.error("❌ CLOUDINARY ERROR: No URL returned from upload");
      console.error("   Result:", result);
      await safeUnlink(filePath);
      throw new Error("Image upload failed: no URL returned.");
    }

    await safeUnlink(filePath);
    console.log("✅ Image uploaded successfully:", uploadedUrl);
    return uploadedUrl;
  } catch (error) {
    await safeUnlink(filePath);

    const errorMessage = String(error?.message || error || "");
    console.error("❌ CLOUDINARY UPLOAD ERROR:", errorMessage);
    console.error("   Full error:", error);

    // Don't expose secrets; return safe message
    if (errorMessage.includes("Invalid") || errorMessage.includes("Unauthorized") || errorMessage.includes("signature")) {
      console.error("   Likely cause: Invalid Cloudinary credentials");
      throw new Error("Server image upload authentication failed. Please contact support.");
    }

    throw new Error("Image upload failed. Please try again.");
  }
};
