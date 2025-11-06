// Centralized app configuration
// Load Cloudinary configuration from environment variables
// Make sure to create a .env file with your Cloudinary credentials
// See .env.example for the required variables

export const CLOUDINARY_CLOUD_NAME = import.meta?.env?.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "daz2pyisr";
export const CLOUDINARY_UPLOAD_PRESET = import.meta?.env?.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || "chat_uploads";

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}


