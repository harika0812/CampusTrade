import multer from "multer";
import path from "path";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const validateUploadedImage = (file) => {
  if (!file) {
    return { ok: false, message: "An image is required." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return { ok: false, message: "Only JPG, PNG, and WEBP images are allowed." };
  }

  if ((Number(file.size) || 0) > MAX_FILE_SIZE) {
    return { ok: false, message: "Image must be smaller than 5MB." };
  }

  return { ok: true };
};

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});

export const fileFilter = (req, file, cb) => {
  const validation = validateUploadedImage(file);
  if (!validation.ok) {
    return cb(new Error(validation.message), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export default upload;