"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentRepository = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
function rowToAttachment(row) {
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
class SQLiteAttachmentRepository {
    constructor() {
        this.initTable();
    }
    initTable() {
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
        db_1.db.exec(createTableSQL);
    }
    async findByTodoId(todoId) {
        const stmt = db_1.db.prepare("SELECT * FROM attachments WHERE todoId = ?");
        const rows = stmt.all(todoId);
        return rows.map(rowToAttachment);
    }
    async findById(id) {
        const stmt = db_1.db.prepare("SELECT * FROM attachments WHERE id = ?");
        const row = stmt.get(id);
        return row ? rowToAttachment(row) : null;
    }
    async create(todoId, filename, originalName, mimeType, size) {
        const now = new Date();
        const attachment = {
            id: (0, uuid_1.v4)(),
            todoId,
            filename,
            originalName,
            mimeType,
            size,
            createdAt: now,
        };
        const stmt = db_1.db.prepare(`
      INSERT INTO attachments (id, todoId, filename, originalName, mimeType, size, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(attachment.id, attachment.todoId, attachment.filename, attachment.originalName, attachment.mimeType, attachment.size, attachment.createdAt.toISOString());
        return attachment;
    }
    async delete(id) {
        const stmt = db_1.db.prepare("DELETE FROM attachments WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
    async deleteByTodoId(todoId) {
        const stmt = db_1.db.prepare("DELETE FROM attachments WHERE todoId = ?");
        stmt.run(todoId);
    }
}
exports.attachmentRepository = new SQLiteAttachmentRepository();
//# sourceMappingURL=AttachmentRepository.js.map