/**
 * File Upload Middleware Configuration
 *
 * Handles file uploads with:
 * - Multer for multipart/form-data
 * - UUID for unique filenames
 * - File validation (size, type, extension)
 * - User-specific directory structure
 */

import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { Request } from "express";

// Upload directory base path
const UPLOAD_BASE_DIR = "uploads";

// Allowed file types
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"];

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Create upload directory if it doesn't exist
 */
export async function ensureUploadDirectory(userId: string): Promise<string> {
  const uploadDir = path.join(UPLOAD_BASE_DIR, userId);

  try {
    await fs.access(uploadDir);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(uploadDir, { recursive: true });
  }

  return uploadDir;
}

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
  destination: async (req: Request, _file, cb) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return cb(new Error("User not authenticated"), "");
      }

      const uploadDir = await ensureUploadDirectory(userId);
      cb(null, uploadDir);
    } catch (error: any) {
      cb(error, "");
    }
  },
  filename: (_req, file, cb) => {
    try {
      // Sanitize original filename
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const ext = path.extname(sanitizedName);
      const uniqueName = `${uuidv4()}${ext}`;

      cb(null, uniqueName);
    } catch (error: any) {
      cb(error, "");
    }
  },
});

/**
 * File filter for validating file types
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only PNG, JPG, and PDF are allowed.")
    );
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(
        "Invalid file extension. Only .png, .jpg, .jpeg, and .pdf are allowed."
      )
    );
  }

  cb(null, true);
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file at a time
  },
});

/**
 * Get file path for a user's attachment
 */
export function getFilePath(userId: string, storedFilename: string): string {
  return path.join(UPLOAD_BASE_DIR, userId, storedFilename);
}

/**
 * Delete file from filesystem
 */
export async function deleteFile(
  userId: string,
  storedFilename: string
): Promise<void> {
  const filePath = getFilePath(userId, storedFilename);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    // File might not exist, log but don't throw
    console.error(`Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(
  userId: string,
  storedFilename: string
): Promise<boolean> {
  const filePath = getFilePath(userId, storedFilename);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
