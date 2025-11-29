import path from "path";
import fs from "fs/promises";
import type { Attachment } from "../models/Attachment";
import { attachmentRepository } from "../repositories/AttachmentRepository";
import { todoRepository } from "../repositories/TodoRepository";
import { UPLOAD_DIR } from "../middleware/uploadMiddleware";

export class AttachmentService {
  /**
   * Add a new attachment to a todo
   */
  async addAttachment(
    userId: string,
    todoId: string,
    file: Express.Multer.File
  ): Promise<Attachment> {
    // Validate file exists
    if (!file) {
      throw new Error("INVALID_FILE");
    }

    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      // Clean up uploaded file if todo doesn't exist
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error("Failed to clean up uploaded file:", err);
      }
      throw new Error("TODO_NOT_FOUND");
    }

    try {
      // Create attachment record
      const attachment = attachmentRepository.create({
        todoId,
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

      return attachment;
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error("Failed to clean up uploaded file:", err);
      }
      throw error;
    }
  }

  /**
   * List all attachments for a todo
   */
  async listAttachments(
    userId: string,
    todoId: string
  ): Promise<Attachment[]> {
    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      throw new Error("TODO_NOT_FOUND");
    }

    return attachmentRepository.findByTodoId(todoId, userId);
  }

  /**
   * Get attachment for download (with file path)
   */
  async getAttachmentForDownload(
    userId: string,
    attachmentId: string
  ): Promise<{ attachment: Attachment; filePath: string }> {
    // Find attachment and verify ownership
    const attachment = attachmentRepository.findById(attachmentId, userId);
    if (!attachment) {
      throw new Error("ATTACHMENT_NOT_FOUND");
    }

    // Build file path
    const filePath = path.join(UPLOAD_DIR, attachment.filename);

    // Verify file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`File not found: ${filePath}`, error);
      throw new Error("FILE_NOT_FOUND");
    }

    return { attachment, filePath };
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(userId: string, attachmentId: string): Promise<void> {
    // Find attachment and verify ownership
    const attachment = attachmentRepository.findById(attachmentId, userId);
    if (!attachment) {
      throw new Error("ATTACHMENT_NOT_FOUND");
    }

    // Delete file from filesystem
    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete from database
    const deleted = attachmentRepository.delete(attachmentId, userId);
    if (!deleted) {
      throw new Error("ATTACHMENT_NOT_FOUND");
    }
  }

  /**
   * Delete all attachments for a todo (used when deleting a todo)
   */
  async deleteAttachmentsForTodo(todoId: string): Promise<void> {
    // Get all attachments for the todo
    const stmt = require("../db/sqlite").default.prepare(`
      SELECT filename FROM attachments WHERE todo_id = ?
    `);
    const rows = stmt.all(todoId) as Array<{ filename: string }>;

    // Delete files from filesystem
    for (const row of rows) {
      const filePath = path.join(UPLOAD_DIR, row.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
      }
    }

    // Delete from database
    attachmentRepository.deleteByTodoId(todoId);
  }
}

export const attachmentService = new AttachmentService();
