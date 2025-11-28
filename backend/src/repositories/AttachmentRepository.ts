import { Attachment, CreateAttachmentDto } from "../models/Attachment";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

export interface IAttachmentRepository {
  findByTodoId(todoId: string, userId: string): Promise<Attachment[]>;
  findById(id: string): Promise<Attachment | null>;
  create(data: CreateAttachmentDto): Promise<Attachment>;
  delete(id: string): Promise<boolean>;
  deleteByTodoId(todoId: string): Promise<number>;
}

class SqliteAttachmentRepository implements IAttachmentRepository {
  private db: Database.Database;
  private uploadsDir: string;

  constructor(
    db: Database.Database,
    uploadsDir: string = process.env.UPLOADS_DIR || "./uploads"
  ) {
    this.db = db;
    this.uploadsDir = uploadsDir;
    this.ensureUploadsDir();
  }

  private ensureUploadsDir(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private rowToAttachment(row: any): Attachment {
    return {
      id: row.id,
      todoId: row.todoId,
      userId: row.userId,
      filename: row.filename,
      originalName: row.originalName,
      mimeType: row.mimeType,
      size: row.size,
      uploadedAt: new Date(row.uploadedAt),
    };
  }

  async findByTodoId(todoId: string, userId: string): Promise<Attachment[]> {
    const query = "SELECT * FROM attachments WHERE todoId = ? AND userId = ?";
    const rows = this.db.prepare(query).all(todoId, userId);
    return rows.map((row) => this.rowToAttachment(row));
  }

  async findById(id: string): Promise<Attachment | null> {
    const query = "SELECT * FROM attachments WHERE id = ?";
    const row = this.db.prepare(query).get(id);
    return row ? this.rowToAttachment(row) : null;
  }

  async create(data: CreateAttachmentDto): Promise<Attachment> {
    const now = new Date();
    const attachment: Attachment = {
      id: uuidv4(),
      todoId: data.todoId,
      userId: data.userId,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      uploadedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO attachments (
        id, todoId, userId, filename, originalName, mimeType, size, uploadedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      attachment.id,
      attachment.todoId,
      attachment.userId,
      attachment.filename,
      attachment.originalName,
      attachment.mimeType,
      attachment.size,
      attachment.uploadedAt.toISOString()
    );

    return attachment;
  }

  async delete(id: string): Promise<boolean> {
    // Get the attachment to delete the file
    const attachment = await this.findById(id);
    if (!attachment) return false;

    // Delete from database
    const stmt = this.db.prepare("DELETE FROM attachments WHERE id = ?");
    const result = stmt.run(id);

    // Delete the physical file
    if (result.changes > 0) {
      const filePath = path.join(this.uploadsDir, attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return result.changes > 0;
  }

  async deleteByTodoId(todoId: string): Promise<number> {
    // Get all attachments for this todo to delete files
    const attachments = this.db
      .prepare("SELECT * FROM attachments WHERE todoId = ?")
      .all(todoId) as any[];

    // Delete from database
    const stmt = this.db.prepare("DELETE FROM attachments WHERE todoId = ?");
    const result = stmt.run(todoId);

    // Delete physical files
    if (result.changes > 0) {
      attachments.forEach((attachment: any) => {
        const filePath = path.join(this.uploadsDir, attachment.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    return result.changes;
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }
}

import { todoRepository } from "./TodoRepository";
export const attachmentRepository = new SqliteAttachmentRepository(
  todoRepository.getDatabase()
);
