import type Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import type { Attachment, CreateAttachmentDto } from "../models/Attachment";

export interface AttachmentRepository {
  create(data: CreateAttachmentDto): Attachment;
  findById(id: string): Attachment | null;
  findByTodoId(todoId: string): Attachment[];
  delete(id: string): boolean;
  deleteByTodoId(todoId: string): void;
}

export class SqliteAttachmentRepository implements AttachmentRepository {
  constructor(private db: Database.Database) {}

  create(data: CreateAttachmentDto): Attachment {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO attachments (id, todoId, userId, filename, originalName, mimeType, size, path, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.todoId,
      data.userId,
      data.filename,
      data.originalName,
      data.mimeType,
      data.size,
      data.path,
      createdAt
    );

    return {
      id,
      ...data,
      createdAt,
    };
  }

  findById(id: string): Attachment | null {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `);

    const row = stmt.get(id) as Attachment | undefined;
    return row || null;
  }

  findByTodoId(todoId: string): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments WHERE todoId = ? ORDER BY createdAt DESC
    `);

    return stmt.all(todoId) as Attachment[];
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM attachments WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByTodoId(todoId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM attachments WHERE todoId = ?
    `);

    stmt.run(todoId);
  }
}

export class InMemoryAttachmentRepository implements AttachmentRepository {
  private attachments: Map<string, Attachment> = new Map();

  create(data: CreateAttachmentDto): Attachment {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const attachment: Attachment = {
      id,
      ...data,
      createdAt,
    };

    this.attachments.set(id, attachment);
    return attachment;
  }

  findById(id: string): Attachment | null {
    return this.attachments.get(id) || null;
  }

  findByTodoId(todoId: string): Attachment[] {
    return Array.from(this.attachments.values())
      .filter((a) => a.todoId === todoId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  delete(id: string): boolean {
    return this.attachments.delete(id);
  }

  deleteByTodoId(todoId: string): void {
    for (const [id, attachment] of this.attachments.entries()) {
      if (attachment.todoId === todoId) {
        this.attachments.delete(id);
      }
    }
  }
}
