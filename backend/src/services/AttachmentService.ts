import attachmentRepository from "../repositories/AttachmentRepository";
import { todoRepository } from "../repositories/TodoRepository";
import {
  Attachment,
  CreateAttachmentDto,
  isValidFileSize,
  isValidMimeType,
} from "../models/Attachment";
import fs from "fs";

export class AttachmentService {
  async getAttachmentsByTodoId(
    todoId: string,
    userId: string
  ): Promise<Attachment[]> {
    // Verify user owns the todo
    const todo = await todoRepository.findByIdAndUser(todoId, userId);
    if (!todo) {
      throw new Error("Todo not found or access denied");
    }
    return attachmentRepository.findByTodoId(todoId);
  }

  async getAttachmentById(id: string, userId: string): Promise<Attachment> {
    const attachment = attachmentRepository.findById(id);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user owns the todo
    const todo = await todoRepository.findByIdAndUser(
      attachment.todoId,
      userId
    );
    if (!todo) {
      throw new Error("Access denied");
    }

    return attachment;
  }

  async createAttachment(
    todoId: string,
    userId: string,
    file: any
  ): Promise<Attachment> {
    // Verify user owns the todo
    const todo = await todoRepository.findByIdAndUser(todoId, userId);
    if (!todo) {
      // Delete uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error("Todo not found or access denied");
    }

    // Validate file type
    if (!isValidMimeType(file.mimetype)) {
      // Delete uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(
        "Invalid file type. Only PNG, JPG, and PDF files are allowed."
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      // Delete uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error("File too large. Maximum size is 5MB.");
    }

    const attachmentData: CreateAttachmentDto = {
      todoId,
      filename: file.filename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
    };

    return attachmentRepository.create(attachmentData);
  }

  async deleteAttachment(id: string, userId: string): Promise<void> {
    const attachment = await this.getAttachmentById(id, userId);

    // Delete file from disk
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    const deleted = attachmentRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete attachment");
    }
  }
}

export default new AttachmentService();
