import db from "../database/Database";
import { v4 as uuidv4 } from "uuid";
import { Attachment, CreateAttachmentDto } from "../models/Attachment";

export class AttachmentRepository {
  findByTodoId(todoId: string): Attachment[] {
    const stmt = db.prepare(
      "SELECT * FROM attachments WHERE todoId = ? ORDER BY createdAt ASC"
    );
    return stmt.all(todoId) as Attachment[];
  }

  findById(id: string): Attachment | undefined {
    const stmt = db.prepare("SELECT * FROM attachments WHERE id = ?");
    return stmt.get(id) as Attachment | undefined;
  }

  create(data: CreateAttachmentDto): Attachment {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO attachments (id, todoId, filename, originalFilename, mimeType, fileSize, filePath, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.todoId,
      data.filename,
      data.originalFilename,
      data.mimeType,
      data.fileSize,
      data.filePath,
      now
    );

    return {
      id,
      ...data,
      createdAt: now,
    };
  }

  delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM attachments WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export default new AttachmentRepository();
