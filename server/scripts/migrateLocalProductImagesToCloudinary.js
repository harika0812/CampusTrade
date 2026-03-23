import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

dotenv.config();

const isRemoteUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const looksLikeLocalUploadPath = (value) => {
  const normalized = String(value || "").replace(/\\/g, "/").trim();
  return normalized.startsWith("uploads/") || normalized.includes("/uploads/");
};

const resolveLocalPathCandidates = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];

  const normalized = raw.replace(/\\/g, "/").replace(/^\/+/, "");

  // If DB value already contains an absolute path, keep it.
  if (path.isAbsolute(raw)) return [raw];

  const cwd = process.cwd();
  const parent = path.resolve(cwd, "..");
  const candidates = new Set();

  const addCandidate = (p) => {
    if (!p) return;
    candidates.add(path.resolve(p));
  };

  if (normalized.startsWith("uploads/")) {
    addCandidate(path.resolve(cwd, normalized));
    addCandidate(path.resolve(parent, normalized));
    return Array.from(candidates);
  }

  const uploadsIndex = normalized.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    const fromUploads = normalized.slice(uploadsIndex + 1);
    addCandidate(path.resolve(cwd, fromUploads));
    addCandidate(path.resolve(parent, fromUploads));
    return Array.from(candidates);
  }

  addCandidate(path.resolve(cwd, normalized));
  addCandidate(path.resolve(parent, normalized));
  return Array.from(candidates);
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const migrate = async () => {
  const { isCloudinaryConfigured, uploadProductImage } = await import("../src/config/media.js");

  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in environment");
    process.exit(1);
  }

  if (!isCloudinaryConfigured) {
    console.error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({ images: { $exists: true, $ne: [] } }).select("_id title images");

  let scanned = 0;
  let migrated = 0;
  let skippedRemote = 0;
  let skippedNonUpload = 0;
  let missingLocalFiles = 0;
  let failed = 0;

  for (const product of products) {
    let changed = false;
    const nextImages = [...(product.images || [])];

    for (let i = 0; i < nextImages.length; i += 1) {
      scanned += 1;
      const current = String(nextImages[i] || "").trim();

      if (!current) {
        skippedNonUpload += 1;
        continue;
      }

      if (isRemoteUrl(current)) {
        skippedRemote += 1;
        continue;
      }

      if (!looksLikeLocalUploadPath(current)) {
        skippedNonUpload += 1;
        continue;
      }

      const candidates = resolveLocalPathCandidates(current);
      let localPath = "";

      for (const candidate of candidates) {
        // eslint-disable-next-line no-await-in-loop
        if (await fileExists(candidate)) {
          localPath = candidate;
          break;
        }
      }

      if (!localPath) {
        missingLocalFiles += 1;
        console.warn(`[MISSING] ${product._id} ${current} -> checked: ${candidates.join(" | ")}`);
        continue;
      }

      try {
        const cloudUrl = await uploadProductImage(localPath);
        if (!cloudUrl) {
          throw new Error("Cloudinary upload returned empty URL");
        }
        nextImages[i] = cloudUrl;
        migrated += 1;
        changed = true;
        console.log(`[MIGRATED] ${product._id} image#${i + 1}`);
      } catch (error) {
        failed += 1;
        console.error(`[FAILED] ${product._id} image#${i + 1}: ${error.message}`);
      }
    }

    if (changed) {
      product.images = nextImages;
      await product.save();
    }
  }

  console.log("\nMigration complete");
  console.log(`Products scanned: ${products.length}`);
  console.log(`Images scanned: ${scanned}`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Already remote: ${skippedRemote}`);
  console.log(`Skipped (non uploads path): ${skippedNonUpload}`);
  console.log(`Missing local files: ${missingLocalFiles}`);
  console.log(`Failed uploads: ${failed}`);

  await mongoose.disconnect();
};

migrate()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Migration failed:", error);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors during failure handling.
    }
    process.exit(1);
  });
