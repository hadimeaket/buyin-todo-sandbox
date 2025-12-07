import { SqliteAttachmentRepository } from "../repositories/AttachmentRepository";
import { Attachment, AttachmentResponse } from "../models/Attachment";
import { FileValidationService } from "./FileValidationService";
import path from "path";
import fs from "fs";

export class AttachmentService {
  private attachmentRepository: SqliteAttachmentRepository;
  private fileValidationService: FileValidationService;
  private uploadDir: string;

  constructor() {
    this.attachmentRepository = new SqliteAttachmentRepository();
    this.fileValidationService = new FileValidationService();
    // Store uploads in data/uploads directory
    this.uploadDir = path.join(__dirname, "../../data/uploads");
    this.fileValidationService.ensureUploadDirectory(this.uploadDir);
  }

  async getAttachmentsByTodoId(todoId: string): Promise<AttachmentResponse[]> {
    const attachments = this.attachmentRepository.findByTodoId(todoId);
    return attachments.map(this.toResponse);
  }

  async getAttachmentById(id: string): Promise<Attachment | null> {
    return this.attachmentRepository.findById(id);
  }

  async createAttachment(
    todoId: string,
    file: { originalname: string; size: number; mimetype: string; buffer: Buffer }
  ): Promise<AttachmentResponse> {
    // Validate file
    const validation = this.fileValidationService.validateFile(
      file.originalname,
      file.size,
      file.mimetype
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const uniqueFilename =
      this.fileValidationService.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Move file to upload directory
    fs.writeFileSync(filePath, file.buffer);

    // Create database record
    const attachment = this.attachmentRepository.create({
      todo_id: todoId,
      filename: uniqueFilename,
      original_filename: file.originalname,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.mimetype,
    });

    return this.toResponse(attachment);
  }

  async deleteAttachment(id: string): Promise<boolean> {
    // Get attachment to find file path
    const attachment = this.attachmentRepository.findById(id);
    if (!attachment) {
      return false;
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    // Delete database record
    return this.attachmentRepository.delete(id);
  }

  async deleteAttachmentsByTodoId(todoId: string): Promise<void> {
    // Get all attachments for the todo
    const attachments = this.attachmentRepository.findByTodoId(todoId);

    // Delete files from filesystem
    for (const attachment of attachments) {
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }
    }

    // Delete database records
    this.attachmentRepository.deleteByTodoId(todoId);
  }

  private toResponse(attachment: Attachment): AttachmentResponse {
    return {
      id: attachment.id,
      todo_id: attachment.todo_id,
      filename: attachment.filename,
      original_filename: attachment.original_filename,
      file_size: attachment.file_size,
      mime_type: attachment.mime_type,
      uploaded_at: attachment.uploaded_at.toISOString(),
    };
  }
}
