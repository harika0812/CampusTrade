import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import { createProduct } from "../src/controllers/product.controller.js";

const loadModules = async () => {
  const [{ uploadProductImage }, { MAX_FILE_SIZE, validateUploadedImage, fileFilter }] = await Promise.all([
    import("../src/config/media.js"),
    import("../src/middlewares/upload.middleware.js"),
  ]);

  return { uploadProductImage, MAX_FILE_SIZE, validateUploadedImage, fileFilter };
};

const createTempFile = async (name, contents = Buffer.from("fake-image-content")) => {
  const filePath = path.join(os.tmpdir(), `${Date.now()}-${name}`);
  await fs.writeFile(filePath, contents);
  return filePath;
};

test("accepts a valid image and cleans up the temporary file after upload", async () => {
  const { uploadProductImage } = await loadModules();
  const filePath = await createTempFile("valid.png", Buffer.from("valid-image"));
  const originalUpload = cloudinary.uploader.upload;
  cloudinary.uploader.upload = async (targetPath) => {
    assert.equal(targetPath, filePath);
    return { secure_url: "https://res.cloudinary.com/demo/campustrade/products/valid.png" };
  };

  try {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "demo-key";
    process.env.CLOUDINARY_API_SECRET = "demo-secret";

    const url = await uploadProductImage(filePath);
    assert.equal(url, "https://res.cloudinary.com/demo/campustrade/products/valid.png");
    await assert.rejects(() => fs.access(filePath), /ENOENT|no such file|not found/);
  } finally {
    cloudinary.uploader.upload = originalUpload;
  }
});

test("rejects unsupported mime types", async () => {
  const { validateUploadedImage, fileFilter } = await loadModules();
  const result = validateUploadedImage({ mimetype: "application/pdf", size: 10_000 });
  assert.equal(result.ok, false);
  assert.match(result.message, /JPG, PNG, and WEBP/);

  await new Promise((resolve, reject) => {
    fileFilter({}, { mimetype: "application/pdf", originalname: "bad.pdf" }, (error, isAccepted) => {
      if (error) {
        assert.match(error.message, /JPG, PNG, and WEBP/);
        return resolve();
      }
      reject(new Error("Expected invalid MIME type to be rejected"));
    });
  });
});

test("rejects oversized uploads", async () => {
  const { MAX_FILE_SIZE, validateUploadedImage } = await loadModules();
  const result = validateUploadedImage({ mimetype: "image/png", size: MAX_FILE_SIZE + 1 });
  assert.equal(result.ok, false);
  assert.match(result.message, /smaller than 5MB/i);
});

test("throws a clear error when Cloudinary is missing", async () => {
  const { uploadProductImage } = await loadModules();
  const filePath = await createTempFile("missing-config.png", Buffer.from("image"));
  const originalCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const originalApiKey = process.env.CLOUDINARY_API_KEY;
  const originalApiSecret = process.env.CLOUDINARY_API_SECRET;

  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  try {
    await assert.rejects(
      () => uploadProductImage(filePath),
      /Cloudinary is not configured/
    );
  } finally {
    if (originalCloudName) process.env.CLOUDINARY_CLOUD_NAME = originalCloudName;
    if (originalApiKey) process.env.CLOUDINARY_API_KEY = originalApiKey;
    if (originalApiSecret) process.env.CLOUDINARY_API_SECRET = originalApiSecret;
    await fs.rm(filePath, { force: true });
  }
});

test("throws a safe error when Cloudinary upload fails", async () => {
  const { uploadProductImage } = await loadModules();
  const filePath = await createTempFile("cloudinary-failure.png", Buffer.from("image"));
  const originalUpload = cloudinary.uploader.upload;

  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "demo-key";
  process.env.CLOUDINARY_API_SECRET = "demo-secret";
  cloudinary.uploader.upload = async () => {
    throw new Error("API key invalid");
  };

  try {
    await assert.rejects(
      () => uploadProductImage(filePath),
      /Image upload failed\. Please try again\./
    );
    await assert.rejects(() => fs.access(filePath), /ENOENT|no such file|not found/);
  } finally {
    cloudinary.uploader.upload = originalUpload;
  }
});

test("creates a product only after a valid image upload succeeds", async () => {
  const { uploadProductImage } = await loadModules();
  const filePath = await createTempFile("product-create.png", Buffer.from("img"));
  const originalUpload = cloudinary.uploader.upload;
  const originalFindById = User.findById;
  const originalCreate = Product.create;

  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "demo-key";
  process.env.CLOUDINARY_API_SECRET = "demo-secret";

  cloudinary.uploader.upload = async () => ({
    secure_url: "https://res.cloudinary.com/demo/campustrade/products/product-create.png",
  });

  User.findById = () => ({
    select() {
      return {
        _id: "user-1",
        rollNo: "2021001",
        className: "CSE-A",
        branch: "CSE",
        year: "2024",
      };
    },
  });

  Product.create = async (payload) => {
    assert.deepEqual(payload.images, ["https://res.cloudinary.com/demo/campustrade/products/product-create.png"]);
    return { ...payload, _id: "product-1" };
  };

  try {
    const req = {
      user: { userId: "user-1" },
      body: {
        title: "Calculator",
        description: "Highly functional scientific calculator",
        price: 1200,
        category: "Others",
        availableCopies: 1,
        listingType: "sell",
        paymentOption: "cod",
      },
      file: { path: filePath },
    };

    const res = {
      statusCode: 200,
      data: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.data = payload;
        return this;
      },
    };

    await createProduct(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.data.product._id, "product-1");
  } finally {
    cloudinary.uploader.upload = originalUpload;
    User.findById = originalFindById;
    Product.create = originalCreate;
    await fs.rm(filePath, { force: true });
  }
});
