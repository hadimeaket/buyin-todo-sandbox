import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { AttachmentRepository } from "../repositories/AttachmentRepository";
import type { Attachment, CreateAttachmentDto } from "../models/Attachment";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {
    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of 5MB`);
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type. Only PNG, JPG, and PDF files are allowed`
      );
    }
  }

  async createAttachment(
    todoId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<Attachment> {
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const attachmentData: CreateAttachmentDto = {
      todoId,
      userId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: `uploads/${filename}`,
    };

    return this.attachmentRepository.create(attachmentData);
  }

  getAttachmentsByTodoId(todoId: string): Attachment[] {
    return this.attachmentRepository.findByTodoId(todoId);
  }

  getAttachmentById(id: string): Attachment | null {
    return this.attachmentRepository.findById(id);
  }

  async deleteAttachment(id: string, userId: string): Promise<boolean> {
    const attachment = this.attachmentRepository.findById(id);

    if (!attachment) {
      return false;
    }

    // Verify user owns the attachment
    if (attachment.userId !== userId) {
      throw new Error("Unauthorized to delete this attachment");
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), "data", attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.attachmentRepository.delete(id);
  }

  getFilePath(attachment: Attachment): string {
    return path.join(process.cwd(), "data", attachment.path);
  }
}
