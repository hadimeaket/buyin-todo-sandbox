"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRepository = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../db");
function rowToTodo(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        completed: row.completed === 1,
        priority: row.priority,
        categoryId: row.categoryId || undefined,
        dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
        dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
        isAllDay: row.isAllDay === null ? undefined : row.isAllDay === 1,
        startTime: row.startTime || undefined,
        endTime: row.endTime || undefined,
        recurrence: (row.recurrence || "none"),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    };
}
class SqliteTodoRepository {
    async findAll(userId) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC");
        const rows = stmt.all(userId);
        return rows.map(rowToTodo);
    }
    async findById(id, userId) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
        const row = stmt.get(id, userId);
        return row ? rowToTodo(row) : null;
    }
    async findDuplicate(title, userId, description) {
        const db = (0, db_1.getDatabase)();
        const normalizedTitle = title.toLowerCase().trim();
        const normalizedDesc = description?.toLowerCase().trim();
        let stmt;
        let row;
        if (description) {
            stmt = db.prepare("SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ? AND LOWER(TRIM(description)) = ? LIMIT 1");
            row = stmt.get(userId, normalizedTitle, normalizedDesc);
        }
        else {
            stmt = db.prepare("SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ? AND description IS NULL LIMIT 1");
            row = stmt.get(userId, normalizedTitle);
        }
        return row ? rowToTodo(row) : null;
    }
    async create(data, userId) {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const id = (0, uuid_1.v4)();
        const stmt = db.prepare(`
      INSERT INTO todos (
        id, userId, categoryId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, userId, data.categoryId || null, data.title, data.description || null, 0, data.priority || "medium", data.dueDate || null, data.dueEndDate || null, data.isAllDay === undefined ? 1 : data.isAllDay ? 1 : 0, data.startTime || null, data.endTime || null, data.recurrence || "none", now, now);
        return (await this.findById(id, userId));
    }
    async update(id, data, userId) {
        const db = (0, db_1.getDatabase)();
        const existing = await this.findById(id, userId);
        if (!existing)
            return null;
        const updates = [];
        const values = [];
        if (data.title !== undefined) {
            updates.push("title = ?");
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push("description = ?");
            values.push(data.description || null);
        }
        if (data.completed !== undefined) {
            updates.push("completed = ?");
            values.push(data.completed ? 1 : 0);
        }
        if (data.priority !== undefined) {
            updates.push("priority = ?");
            values.push(data.priority);
        }
        if (data.categoryId !== undefined) {
            updates.push("categoryId = ?");
            values.push(data.categoryId || null);
        }
        if (data.dueDate !== undefined) {
            updates.push("dueDate = ?");
            values.push(data.dueDate || null);
        }
        if (data.dueEndDate !== undefined) {
            updates.push("dueEndDate = ?");
            values.push(data.dueEndDate || null);
        }
        if (data.isAllDay !== undefined) {
            updates.push("isAllDay = ?");
            values.push(data.isAllDay ? 1 : 0);
        }
        if (data.startTime !== undefined) {
            updates.push("startTime = ?");
            values.push(data.startTime || null);
        }
        if (data.endTime !== undefined) {
            updates.push("endTime = ?");
            values.push(data.endTime || null);
        }
        if (data.recurrence !== undefined) {
            updates.push("recurrence = ?");
            values.push(data.recurrence);
        }
        updates.push("updatedAt = ?");
        values.push(new Date().toISOString());
        values.push(id);
        values.push(userId);
        const stmt = db.prepare(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND userId = ?`);
        stmt.run(...values);
        return await this.findById(id, userId);
    }
    async toggle(id, userId) {
        const db = (0, db_1.getDatabase)();
        const existing = await this.findById(id, userId);
        if (!existing)
            return null;
        const stmt = db.prepare("UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?");
        stmt.run(existing.completed ? 0 : 1, new Date().toISOString(), id, userId);
        return await this.findById(id, userId);
    }
    async delete(id, userId) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
        const result = stmt.run(id, userId);
        return result.changes > 0;
    }
}
exports.todoRepository = new SqliteTodoRepository();
//# sourceMappingURL=TodoRepository.js.map