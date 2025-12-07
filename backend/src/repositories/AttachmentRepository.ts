import { getDb } from "../database/init";
import { v4 as uuidv4 } from "uuid";
import {
  Attachment,
  CreateAttachmentDto,
} from "../models/Attachment";

interface AttachmentRow {
  id: string;
  todo_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface IAttachmentRepository {
  findByTodoId(todoId: string): Attachment[];
  findById(id: string): Attachment | null;
  create(data: CreateAttachmentDto): Attachment;
  delete(id: string): boolean;
  deleteByTodoId(todoId: string): void;
}

export class SqliteAttachmentRepository implements IAttachmentRepository {
  private rowToAttachment(row: AttachmentRow): Attachment {
    return {
      id: row.id,
      todo_id: row.todo_id,
      filename: row.filename,
      original_filename: row.original_filename,
      file_path: row.file_path,
      file_size: row.file_size,
      mime_type: row.mime_type,
      uploaded_at: new Date(row.uploaded_at),
    };
  }

  findByTodoId(todoId: string): Attachment[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM attachments 
      WHERE todo_id = ?
      ORDER BY uploaded_at DESC
    `);
    const rows = stmt.all(todoId) as AttachmentRow[];
    return rows.map((row) => this.rowToAttachment(row));
  }

  findById(id: string): Attachment | null {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM attachments WHERE id = ?");
    const row = stmt.get(id) as AttachmentRow | undefined;
    return row ? this.rowToAttachment(row) : null;
  }

  create(data: CreateAttachmentDto): Attachment {
    const db = getDb();
    const id = uuidv4();
    const uploaded_at = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO attachments (
        id, todo_id, filename, original_filename, 
        file_path, file_size, mime_type, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.todo_id,
      data.filename,
      data.original_filename,
      data.file_path,
      data.file_size,
      data.mime_type,
      uploaded_at
    );

    return {
      id,
      todo_id: data.todo_id,
      filename: data.filename,
      original_filename: data.original_filename,
      file_path: data.file_path,
      file_size: data.file_size,
      mime_type: data.mime_type,
      uploaded_at: new Date(uploaded_at),
    };
  }

  delete(id: string): boolean {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM attachments WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByTodoId(todoId: string): void {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM attachments WHERE todo_id = ?");
    stmt.run(todoId);
  }
}
