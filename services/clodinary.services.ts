import { cloudinaryConfig } from "@/config/env";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

// Configure Cloudinary - these should be in your environment variables
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

/**
 * Uploads a document (image or PDF) to Cloudinary from base64 data
 * @param base64Data - Base64 string of the document (with data:... prefix)
 * @param folder - Optional folder name for organization
 * @param fileName - Optional original file name
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromBase64 = async (
  base64Data: string,
  folder?: string,
  fileName?: string
): Promise<string> => {
  try {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto", // Supports images and raw files (PDFs)
      quality: "auto",
      fetch_format: "auto",
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (fileName) {
      // Generate public_id from filename without extension
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    const uploadResult = await cloudinary.uploader.upload(
      base64Data,
      uploadOptions
    );

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary document upload error:", error);
    throw new Error("Failed to upload document to cloud storage");
  }
};

/**
 * Uploads a document from File object (for browser usage)
 * @param file - File object from form input
 * @param folder - Optional folder name for organization
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromFile = async (
  file: File,
  folder?: string
): Promise<string> => {
  try {
    // Convert File to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    return await uploadDocumentFromBase64(base64Data, folder, file.name);
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to process and upload document");
  }
};

/**
 * Uploads a document from buffer (for server-side usage)
 * @param buffer - Document buffer
 * @param fileName - Original file name
 * @param folder - Optional folder name for organization
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromBuffer = async (
  buffer: Buffer,
  fileName: string,
  folder?: string
): Promise<string> => {
  try {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto", // Supports images and raw files (PDFs)
      quality: "auto",
      fetch_format: "auto",
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    // Generate public_id from filename
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed without error"));
          })
          .end(buffer);
      }
    );

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary buffer upload error:", error);
    throw new Error("Failed to upload document to cloud storage");
  }
};

/**
 * Upload health certificate specifically for stall applications
 * @param file - Health certificate file (image or PDF)
 * @returns Promise<string> - The secure URL of the uploaded certificate
 */
export const uploadHealthCertificate = async (file: File): Promise<string> => {
  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF file."
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error(
      "File size too large. Please upload a file smaller than 5MB."
    );
  }

  try {
    return await uploadDocumentFromFile(
      file,
      "stall-applications/health-certificates"
    );
  } catch (error) {
    console.error("Health certificate upload error:", error);
    throw new Error("Failed to upload health certificate. Please try again.");
  }
};

/**
 * Upload business license for stall applications
 * @param file - Business license file (image or PDF)
 * @returns Promise<string> - The secure URL of the uploaded license
 */
export const uploadBusinessLicense = async (file: File): Promise<string> => {
  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF file."
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error(
      "File size too large. Please upload a file smaller than 5MB."
    );
  }

  try {
    return await uploadDocumentFromFile(
      file,
      "stall-applications/business-licenses"
    );
  } catch (error) {
    console.error("Business license upload error:", error);
    throw new Error("Failed to upload business license. Please try again.");
  }
};

// Export all functions
const cloudinaryService = {
  uploadDocumentFromBase64,
  uploadDocumentFromFile,
  uploadDocumentFromBuffer,
  uploadHealthCertificate,
  uploadBusinessLicense,
};

export default cloudinaryService;
