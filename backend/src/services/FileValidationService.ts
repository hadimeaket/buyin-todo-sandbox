import path from "path";
import fs from "fs";

// Allowed file configurations
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export class FileValidationService {
  /**
   * Validates file extension
   */
  validateExtension(filename: string): FileValidationResult {
    const ext = path.extname(filename).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validates file size
   */
  validateSize(size: number): FileValidationResult {
    if (size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Validates MIME type
   */
  validateMimeType(mimeType: string): FileValidationResult {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: PNG, JPG, JPEG, PDF`,
      };
    }

    return { valid: true };
  }

  /**
   * Comprehensive file validation
   */
  validateFile(
    filename: string,
    size: number,
    mimeType: string
  ): FileValidationResult {
    // Check extension
    const extValidation = this.validateExtension(filename);
    if (!extValidation.valid) {
      return extValidation;
    }

    // Check size
    const sizeValidation = this.validateSize(size);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }

    // Check MIME type
    const mimeValidation = this.validateMimeType(mimeType);
    if (!mimeValidation.valid) {
      return mimeValidation;
    }

    return { valid: true };
  }

  /**
   * Ensure upload directory exists
   */
  ensureUploadDirectory(uploadDir: string): void {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  /**
   * Generate unique filename to prevent conflicts
   */
  generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${ext}`;
  }
}
