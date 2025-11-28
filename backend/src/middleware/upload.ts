import multer from "multer";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../models/Attachment";

// Use memory storage to handle files in memory before saving
const storage = multer.memoryStorage();

// File filter to validate MIME types
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Only PNG, JPG, and PDF files are allowed.`)
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
