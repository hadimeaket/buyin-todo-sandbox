"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteTodoRepository = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../db/database");
class SqliteTodoRepository {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    /**
     * Convert database row to Todo object
     */
    rowToTodo(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description ?? undefined,
            completed: (0, database_1.intToBool)(row.completed),
            priority: row.priority,
            dueDate: (0, database_1.stringToDate)(row.dueDate),
            dueEndDate: (0, database_1.stringToDate)(row.dueEndDate),
            isAllDay: row.isAllDay !== null ? (0, database_1.intToBool)(row.isAllDay) : undefined,
            startTime: row.startTime ?? undefined,
            endTime: row.endTime ?? undefined,
            recurrence: row.recurrence ?? undefined,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
    async findAll() {
        const stmt = this.db.prepare("SELECT * FROM todos ORDER BY createdAt DESC");
        const rows = stmt.all();
        return rows.map((row) => this.rowToTodo(row));
    }
    async findById(id) {
        const stmt = this.db.prepare("SELECT * FROM todos WHERE id = ?");
        const row = stmt.get(id);
        return row ? this.rowToTodo(row) : null;
    }
    async findDuplicate(title, description) {
        let stmt;
        let row;
        if (description) {
            stmt = this.db.prepare("SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(description)) = LOWER(TRIM(?)) LIMIT 1");
            row = stmt.get(title, description);
        }
        else {
            stmt = this.db.prepare("SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) LIMIT 1");
            row = stmt.get(title);
        }
        return row ? this.rowToTodo(row) : null;
    }
    async create(data) {
        const now = new Date();
        const todo = {
            id: (0, uuid_1.v4)(),
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
            createdAt: now,
            updatedAt: now,
        };
        const stmt = this.db.prepare(`
      INSERT INTO todos (
        id, title, description, completed, priority, 
        dueDate, dueEndDate, isAllDay, startTime, endTime, 
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(todo.id, todo.title, todo.description ?? null, (0, database_1.boolToInt)(todo.completed), todo.priority, (0, database_1.dateToString)(todo.dueDate), (0, database_1.dateToString)(todo.dueEndDate), todo.isAllDay !== undefined ? (0, database_1.boolToInt)(todo.isAllDay) : null, todo.startTime ?? null, todo.endTime ?? null, todo.recurrence ?? null, (0, database_1.dateToString)(todo.createdAt), (0, database_1.dateToString)(todo.updatedAt));
        return todo;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const updatedTodo = {
            ...existing,
            title: data.title !== undefined ? data.title : existing.title,
            description: data.description !== undefined ? data.description : existing.description,
            completed: data.completed !== undefined ? data.completed : existing.completed,
            priority: data.priority !== undefined ? data.priority : existing.priority,
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
            updatedAt: new Date(),
        };
        const stmt = this.db.prepare(`
      UPDATE todos 
      SET title = ?, description = ?, completed = ?, priority = ?,
          dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?, 
          endTime = ?, recurrence = ?, updatedAt = ?
      WHERE id = ?
    `);
        stmt.run(updatedTodo.title, updatedTodo.description ?? null, (0, database_1.boolToInt)(updatedTodo.completed), updatedTodo.priority, (0, database_1.dateToString)(updatedTodo.dueDate), (0, database_1.dateToString)(updatedTodo.dueEndDate), updatedTodo.isAllDay !== undefined
            ? (0, database_1.boolToInt)(updatedTodo.isAllDay)
            : null, updatedTodo.startTime ?? null, updatedTodo.endTime ?? null, updatedTodo.recurrence ?? null, (0, database_1.dateToString)(updatedTodo.updatedAt), id);
        return updatedTodo;
    }
    async toggle(id) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const updatedTodo = {
            ...existing,
            completed: !existing.completed,
            updatedAt: new Date(),
        };
        const stmt = this.db.prepare("UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?");
        stmt.run((0, database_1.boolToInt)(updatedTodo.completed), (0, database_1.dateToString)(updatedTodo.updatedAt), id);
        return updatedTodo;
    }
    async delete(id) {
        const stmt = this.db.prepare("DELETE FROM todos WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
exports.SqliteTodoRepository = SqliteTodoRepository;
//# sourceMappingURL=SqliteTodoRepository.js.map