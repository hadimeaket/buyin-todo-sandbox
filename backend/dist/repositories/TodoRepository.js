"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRepository = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const AttachmentRepository_1 = require("./AttachmentRepository");
async function rowToTodo(row) {
    const attachments = await AttachmentRepository_1.attachmentRepository.findByTodoId(row.id);
    return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        description: row.description || undefined,
        completed: row.completed === 1,
        priority: row.priority,
        dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
        dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
        isAllDay: row.isAllDay === 1,
        startTime: row.startTime || undefined,
        endTime: row.endTime || undefined,
        recurrence: row.recurrence,
        categoryId: row.categoryId || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    };
}
class SQLiteTodoRepository {
    async findAll(userId) {
        const stmt = db_1.db.prepare("SELECT * FROM todos WHERE userId = ?");
        const rows = stmt.all(userId);
        return Promise.all(rows.map(rowToTodo));
    }
    async findById(id, userId) {
        const stmt = db_1.db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
        const row = stmt.get(id, userId);
        return row ? await rowToTodo(row) : null;
    }
    async findDuplicate(title, userId, description) {
        const normalizedTitle = title.toLowerCase().trim();
        const normalizedDesc = description?.toLowerCase().trim() || null;
        let stmt;
        let row;
        if (normalizedDesc) {
            stmt = db_1.db.prepare(`
        SELECT * FROM todos 
        WHERE userId = ?
        AND LOWER(TRIM(title)) = ? 
        AND LOWER(TRIM(COALESCE(description, ''))) = ?
        LIMIT 1
      `);
            row = stmt.get(userId, normalizedTitle, normalizedDesc);
        }
        else {
            stmt = db_1.db.prepare(`
        SELECT * FROM todos 
        WHERE userId = ?
        AND LOWER(TRIM(title)) = ? 
        AND (description IS NULL OR description = '')
        LIMIT 1
      `);
            row = stmt.get(userId, normalizedTitle);
        }
        return row ? await rowToTodo(row) : null;
    }
    async create(data, userId) {
        const now = new Date();
        const todo = {
            id: (0, uuid_1.v4)(),
            userId,
            title: data.title,
            description: data.description,
            completed: false,
            priority: data.priority || "medium",
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
            isAllDay: data.isAllDay ?? true,
            startTime: data.startTime,
            endTime: data.endTime,
            recurrence: data.recurrence || "none",
            categoryId: data.categoryId,
            createdAt: now,
            updatedAt: now,
        };
        const stmt = db_1.db.prepare(`
      INSERT INTO todos (
        id, userId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, categoryId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(todo.id, todo.userId, todo.title, todo.description || null, todo.completed ? 1 : 0, todo.priority, todo.dueDate ? todo.dueDate.toISOString() : null, todo.dueEndDate ? todo.dueEndDate.toISOString() : null, todo.isAllDay ? 1 : 0, todo.startTime || null, todo.endTime || null, todo.recurrence, todo.categoryId || null, todo.createdAt.toISOString(), todo.updatedAt.toISOString());
        return todo;
    }
    async update(id, userId, data) {
        const existing = await this.findById(id, userId);
        if (!existing)
            return null;
        const updatedTodo = {
            ...existing,
            ...data,
            dueDate: data.dueDate !== undefined
                ? data.dueDate
                    ? new Date(data.dueDate)
                    : undefined
                : existing.dueDate,
            dueEndDate: data.dueEndDate !== undefined
                ? data.dueEndDate
                    ? new Date(data.dueEndDate)
                    : undefined
                : existing.dueEndDate,
            isAllDay: data.isAllDay !== undefined ? data.isAllDay : existing.isAllDay,
            startTime: data.startTime !== undefined ? data.startTime : existing.startTime,
            endTime: data.endTime !== undefined ? data.endTime : existing.endTime,
            recurrence: data.recurrence !== undefined ? data.recurrence : existing.recurrence,
            categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
            updatedAt: new Date(),
        };
        const stmt = db_1.db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, completed = ?, priority = ?,
        dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?,
        endTime = ?, recurrence = ?, categoryId = ?, updatedAt = ?
      WHERE id = ?
    `);
        stmt.run(updatedTodo.title, updatedTodo.description || null, updatedTodo.completed ? 1 : 0, updatedTodo.priority, updatedTodo.dueDate ? updatedTodo.dueDate.toISOString() : null, updatedTodo.dueEndDate ? updatedTodo.dueEndDate.toISOString() : null, updatedTodo.isAllDay ? 1 : 0, updatedTodo.startTime || null, updatedTodo.endTime || null, updatedTodo.recurrence, updatedTodo.categoryId || null, updatedTodo.updatedAt.toISOString(), id);
        return updatedTodo;
    }
    async toggle(id, userId) {
        const existing = await this.findById(id, userId);
        if (!existing)
            return null;
        const updatedTodo = {
            ...existing,
            completed: !existing.completed,
            updatedAt: new Date(),
        };
        const stmt = db_1.db.prepare(`
      UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?
    `);
        stmt.run(updatedTodo.completed ? 1 : 0, updatedTodo.updatedAt.toISOString(), id);
        return updatedTodo;
    }
    async delete(id, userId) {
        const stmt = db_1.db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
        const result = stmt.run(id, userId);
        return result.changes > 0;
    }
    async removeCategoryFromTodos(categoryId, userId) {
        const stmt = db_1.db.prepare(`
      UPDATE todos 
      SET categoryId = NULL, updatedAt = ?
      WHERE categoryId = ? AND userId = ?
    `);
        stmt.run(new Date().toISOString(), categoryId, userId);
    }
    async clear() {
        const stmt = db_1.db.prepare("DELETE FROM todos");
        stmt.run();
    }
}
exports.todoRepository = new SQLiteTodoRepository();
//# sourceMappingURL=TodoRepository.js.map