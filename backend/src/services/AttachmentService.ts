/**
 * Attachment Service
 *
 * Business logic for file attachment management
 */

import { todoRepository } from "../repositories/TodoRepository";
import { Attachment } from "../models/Todo";
import { deleteFile, fileExists } from "../middleware/uploadMiddleware";
import { v4 as uuidv4 } from "uuid";

export class AttachmentService {
  /**
   * Add attachment to todo
   */
  async addAttachment(
    todoId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<Attachment> {
    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== userId) {
      throw new Error("You do not have permission to modify this todo");
    }

    // Create attachment metadata
    const attachment: Attachment = {
      id: uuidv4(),
      filename: file.originalname,
      storedFilename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };

    // Add attachment to todo
    const currentAttachments = todo.attachments || [];
    const updatedTodo = await todoRepository.update(todoId, {
      attachments: [...currentAttachments, attachment] as any,
    });

    if (!updatedTodo) {
      // Rollback: delete uploaded file
      await deleteFile(userId, file.filename);
      throw new Error("Failed to add attachment to todo");
    }

    return attachment;
  }

  /**
   * Get all attachments for a todo
   */
  async getAttachments(todoId: string, userId: string): Promise<Attachment[]> {
    const todo = await todoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== userId) {
      throw new Error("You do not have permission to view this todo");
    }

    return todo.attachments || [];
  }

  /**
   * Get single attachment by ID
   */
  async getAttachment(
    todoId: string,
    attachmentId: string,
    userId: string
  ): Promise<{ attachment: Attachment; filePath: string }> {
    const todo = await todoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== userId) {
      throw new Error("You do not have permission to view this todo");
    }

    console.log("Looking for attachment:", attachmentId);
    console.log(
      "Available attachments:",
      (todo.attachments || []).map((a) => ({ id: a.id, filename: a.filename }))
    );

    const attachment = (todo.attachments || []).find(
      (a) => a.id === attachmentId
    );

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify file exists on disk
    const exists = await fileExists(userId, attachment.storedFilename);
    if (!exists) {
      throw new Error("Attachment file not found on disk");
    }

    // Return attachment and file path
    const { getFilePath } = await import("../middleware/uploadMiddleware");
    const filePath = getFilePath(userId, attachment.storedFilename);

    return { attachment, filePath };
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    todoId: string,
    attachmentId: string,
    userId: string
  ): Promise<void> {
    const todo = await todoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== userId) {
      throw new Error("You do not have permission to modify this todo");
    }

    const attachments = todo.attachments || [];
    const attachment = attachments.find((a) => a.id === attachmentId);

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Remove attachment from todo
    const updatedAttachments = attachments.filter((a) => a.id !== attachmentId);
    const updatedTodo = await todoRepository.update(todoId, {
      attachments: updatedAttachments as any,
    });

    if (!updatedTodo) {
      throw new Error("Failed to delete attachment from todo");
    }

    // Delete file from filesystem
    await deleteFile(userId, attachment.storedFilename);
  }

  /**
   * Delete all attachments for a todo (when todo is deleted)
   */
  async deleteAllAttachments(todoId: string, userId: string): Promise<void> {
    const todo = await todoRepository.findById(todoId);

    if (!todo || !todo.attachments) {
      return;
    }

    // Delete all files from filesystem
    for (const attachment of todo.attachments) {
      await deleteFile(userId, attachment.storedFilename);
    }
  }
}

export const attachmentService = new AttachmentService();
