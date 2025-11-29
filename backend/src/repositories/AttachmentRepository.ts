import db from "../db/sqlite";
import { v4 as uuidv4 } from "uuid";
import type { Attachment, CreateAttachmentInput } from "../models/Attachment";

export class AttachmentRepository {
  /**
   * Map database row to Attachment interface
   */
  private mapRowToAttachment(row: {
    id: string;
    todo_id: string;
    user_id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    created_at: string;
  }): Attachment {
    return {
      id: row.id,
      todoId: row.todo_id,
      userId: row.user_id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      createdAt: row.created_at,
    };
  }

  /**
   * Create a new attachment
   */
  create(input: CreateAttachmentInput): Attachment {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO attachments (id, todo_id, user_id, filename, original_name, mime_type, size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.todoId,
      input.userId,
      input.filename,
      input.originalName,
      input.mimeType,
      input.size,
      createdAt
    );

    return {
      id,
      ...input,
      createdAt,
    };
  }

  /**
   * Find all attachments for a specific todo (filtered by userId for security)
   */
  findByTodoId(todoId: string, userId: string): Attachment[] {
    const stmt = db.prepare(`
      SELECT * FROM attachments 
      WHERE todo_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(todoId, userId) as Array<{
      id: string;
      todo_id: string;
      user_id: string;
      filename: string;
      original_name: string;
      mime_type: string;
      size: number;
      created_at: string;
    }>;

    return rows.map((row) => this.mapRowToAttachment(row));
  }

  /**
   * Find a specific attachment by ID (filtered by userId for security)
   */
  findById(id: string, userId: string): Attachment | null {
    const stmt = db.prepare(`
      SELECT * FROM attachments 
      WHERE id = ? AND user_id = ?
    `);

    const row = stmt.get(id, userId) as
      | {
          id: string;
          todo_id: string;
          user_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          created_at: string;
        }
      | undefined;

    return row ? this.mapRowToAttachment(row) : null;
  }

  /**
   * Delete an attachment (filtered by userId for security)
   */
  delete(id: string, userId: string): boolean {
    const stmt = db.prepare(`
      DELETE FROM attachments 
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * Delete all attachments for a specific todo (used when deleting a todo)
   */
  deleteByTodoId(todoId: string): number {
    const stmt = db.prepare(`
      DELETE FROM attachments 
      WHERE todo_id = ?
    `);

    const result = stmt.run(todoId);
    return result.changes;
  }
}

export const attachmentRepository = new AttachmentRepository();
