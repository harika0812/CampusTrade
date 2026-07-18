import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

// Validate required environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_URL"
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars.join(", "));
  console.error("📋 Copy .env.example to .env and fill in the values");
  process.exit(1);
}

const requiredCloudinaryVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

if (nodeEnv === "production") {
  const missingCloudinaryVars = requiredCloudinaryVars.filter((varName) => !process.env[varName]);
  if (missingCloudinaryVars.length > 0) {
    console.error("❌ Missing production media variables:", missingCloudinaryVars.join(", "));
    console.error("📋 Set Cloudinary variables for production image storage");
    process.exit(1);
  }
}

export const env = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

export const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};