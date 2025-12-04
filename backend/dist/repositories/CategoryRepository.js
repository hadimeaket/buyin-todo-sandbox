"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepository = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
function rowToCategory(row) {
    return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        color: row.color,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    };
}
class SQLiteCategoryRepository {
    async findAll(userId) {
        const stmt = db_1.db.prepare("SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC");
        const rows = stmt.all(userId);
        return rows.map(rowToCategory);
    }
    async findById(id, userId) {
        const stmt = db_1.db.prepare("SELECT * FROM categories WHERE id = ? AND userId = ?");
        const row = stmt.get(id, userId);
        return row ? rowToCategory(row) : null;
    }
    async findByName(name, userId) {
        const stmt = db_1.db.prepare("SELECT * FROM categories WHERE LOWER(TRIM(name)) = ? AND userId = ?");
        const normalizedName = name.toLowerCase().trim();
        const row = stmt.get(normalizedName, userId);
        return row ? rowToCategory(row) : null;
    }
    async create(data, userId) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = db_1.db.prepare(`
      INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, userId, data.name.trim(), data.color, now, now);
        return {
            id,
            userId,
            name: data.name.trim(),
            color: data.color,
            createdAt: new Date(now),
            updatedAt: new Date(now),
        };
    }
    async update(id, userId, data) {
        const existing = await this.findById(id, userId);
        if (!existing)
            return null;
        const now = new Date().toISOString();
        const name = data.name ? data.name.trim() : existing.name;
        const color = data.color || existing.color;
        const stmt = db_1.db.prepare(`
      UPDATE categories
      SET name = ?, color = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);
        stmt.run(name, color, now, id, userId);
        return {
            ...existing,
            name,
            color,
            updatedAt: new Date(now),
        };
    }
    async delete(id, userId) {
        const stmt = db_1.db.prepare("DELETE FROM categories WHERE id = ? AND userId = ?");
        const result = stmt.run(id, userId);
        return result.changes > 0;
    }
}
exports.categoryRepository = new SQLiteCategoryRepository();
//# sourceMappingURL=CategoryRepository.js.map