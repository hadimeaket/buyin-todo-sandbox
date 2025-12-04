import { Attachment } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";

export interface IAttachmentRepository {
  findByTodoId(todoId: string): Promise<Attachment[]>;
  findById(id: string): Promise<Attachment | null>;
  create(
    todoId: string,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<Attachment>;
  delete(id: string): Promise<boolean>;
  deleteByTodoId(todoId: string): Promise<void>;
}

interface AttachmentRow {
  id: string;
  todoId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

function rowToAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    todoId: row.todoId,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    size: row.size,
    createdAt: new Date(row.createdAt),
  };
}

class SQLiteAttachmentRepository implements IAttachmentRepository {
  constructor() {
    this.initTable();
  }

  private initTable(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        todoId TEXT NOT NULL,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE
      )
    `;
    db.exec(createTableSQL);
  }

  async findByTodoId(todoId: string): Promise<Attachment[]> {
    const stmt = db.prepare("SELECT * FROM attachments WHERE todoId = ?");
    const rows = stmt.all(todoId) as AttachmentRow[];
    return rows.map(rowToAttachment);
  }

  async findById(id: string): Promise<Attachment | null> {
    const stmt = db.prepare("SELECT * FROM attachments WHERE id = ?");
    const row = stmt.get(id) as AttachmentRow | undefined;
    return row ? rowToAttachment(row) : null;
  }

  async create(
    todoId: string,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<Attachment> {
    const now = new Date();
    const attachment: Attachment = {
      id: uuidv4(),
      todoId,
      filename,
      originalName,
      mimeType,
      size,
      createdAt: now,
    };

    const stmt = db.prepare(`
      INSERT INTO attachments (id, todoId, filename, originalName, mimeType, size, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      attachment.id,
      attachment.todoId,
      attachment.filename,
      attachment.originalName,
      attachment.mimeType,
      attachment.size,
      attachment.createdAt.toISOString()
    );

    return attachment;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = db.prepare("DELETE FROM attachments WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async deleteByTodoId(todoId: string): Promise<void> {
    const stmt = db.prepare("DELETE FROM attachments WHERE todoId = ?");
    stmt.run(todoId);
  }
}

export const attachmentRepository = new SQLiteAttachmentRepository();
