"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepository = exports.CategoryRepository = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
function rowToCategory(row) {
    return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        color: row.color,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
class CategoryRepository {
    findAllByUserId(userId) {
        const db = (0, db_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM categories WHERE userId = ? ORDER BY createdAt ASC')
            .all(userId);
        return rows.map(rowToCategory);
    }
    findById(id, userId) {
        const db = (0, db_1.getDatabase)();
        const row = db
            .prepare('SELECT * FROM categories WHERE id = ? AND userId = ?')
            .get(id, userId);
        return row ? rowToCategory(row) : null;
    }
    create(dto, userId) {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const category = {
            id: (0, uuid_1.v4)(),
            userId,
            name: dto.name,
            color: dto.color,
            createdAt: now,
            updatedAt: now,
        };
        db.prepare(`INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`).run(category.id, category.userId, category.name, category.color, category.createdAt, category.updatedAt);
        return category;
    }
    update(id, userId, dto) {
        const existing = this.findById(id, userId);
        if (!existing) {
            return null;
        }
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const updatedCategory = {
            ...existing,
            name: dto.name ?? existing.name,
            color: dto.color ?? existing.color,
            updatedAt: now,
        };
        db.prepare(`UPDATE categories
       SET name = ?, color = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`).run(updatedCategory.name, updatedCategory.color, updatedCategory.updatedAt, id, userId);
        return updatedCategory;
    }
    delete(id, userId) {
        const db = (0, db_1.getDatabase)();
        const result = db
            .prepare('DELETE FROM categories WHERE id = ? AND userId = ?')
            .run(id, userId);
        return result.changes > 0;
    }
}
exports.CategoryRepository = CategoryRepository;
exports.categoryRepository = new CategoryRepository();
//# sourceMappingURL=CategoryRepository.js.map