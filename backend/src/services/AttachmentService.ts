import {
  Attachment,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
} from "../models/Attachment";
import { attachmentRepository } from "../repositories/AttachmentRepository";
import { todoRepository } from "../repositories/TodoRepository";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export class AttachmentService {
  async uploadAttachment(
    todoId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<Attachment> {
    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      throw new Error("Todo not found or access denied");
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      throw new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    // Save file to disk
    const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Create database record
    const attachment = await attachmentRepository.create({
      todoId,
      userId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

    return attachment;
  }

  async getAttachmentsByTodoId(
    todoId: string,
    userId: string
  ): Promise<Attachment[]> {
    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      throw new Error("Todo not found or access denied");
    }

    return attachmentRepository.findByTodoId(todoId, userId);
  }

  async getAttachmentById(
    id: string,
    userId: string
  ): Promise<{ attachment: Attachment; filePath: string }> {
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user owns the attachment
    if (attachment.userId !== userId) {
      throw new Error("Access denied");
    }

    const filePath = attachmentRepository.getFilePath(attachment.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found on disk");
    }

    return { attachment, filePath };
  }

  async deleteAttachment(id: string, userId: string): Promise<boolean> {
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user owns the attachment
    if (attachment.userId !== userId) {
      throw new Error("Access denied");
    }

    return attachmentRepository.delete(id);
  }

  async deleteAttachmentsByTodoId(
    todoId: string,
    userId: string
  ): Promise<number> {
    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      throw new Error("Todo not found or access denied");
    }

    return attachmentRepository.deleteByTodoId(todoId);
  }

  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: PNG, JPG, PDF`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
      return {
        valid: false,
        error: "Invalid file extension",
      };
    }

    return { valid: true };
  }
}

export const attachmentService = new AttachmentService();
