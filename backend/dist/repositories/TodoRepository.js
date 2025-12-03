"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRepository = void 0;
const uuid_1 = require("uuid");
class InMemoryTodoRepository {
    constructor() {
        this.todos = [];
    }
    async findAll() {
        return [...this.todos];
    }
    async findById(id) {
        const todo = this.todos.find((t) => t.id === id);
        return todo || null;
    }
    async findDuplicate(title, description) {
        const duplicate = this.todos.find((t) => {
            const titleMatch = t.title.toLowerCase().trim() === title.toLowerCase().trim();
            const descMatch = !description ||
                t.description?.toLowerCase().trim() ===
                    description.toLowerCase().trim();
            return titleMatch && descMatch;
        });
        return duplicate || null;
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
        this.todos.push(todo);
        return todo;
    }
    async update(id, data) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1)
            return null;
        const updatedTodo = {
            ...this.todos[index],
            ...data,
            dueDate: data.dueDate !== undefined
                ? data.dueDate
                    ? new Date(data.dueDate)
                    : undefined
                : this.todos[index].dueDate,
            dueEndDate: data.dueEndDate !== undefined
                ? data.dueEndDate
                    ? new Date(data.dueEndDate)
                    : undefined
                : this.todos[index].dueEndDate,
            isAllDay: data.isAllDay !== undefined
                ? data.isAllDay
                : this.todos[index].isAllDay,
            startTime: data.startTime !== undefined
                ? data.startTime
                : this.todos[index].startTime,
            endTime: data.endTime !== undefined ? data.endTime : this.todos[index].endTime,
            recurrence: data.recurrence !== undefined
                ? data.recurrence
                : this.todos[index].recurrence,
            updatedAt: new Date(),
        };
        this.todos[index] = updatedTodo;
        return updatedTodo;
    }
    async toggle(id) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1)
            return null;
        const updatedTodo = {
            ...this.todos[index],
            completed: !this.todos[index].completed,
            updatedAt: new Date(),
        };
        this.todos[index] = updatedTodo;
        return updatedTodo;
    }
    async delete(id) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1)
            return false;
        this.todos.splice(index, 1);
        return true;
    }
}
exports.todoRepository = new InMemoryTodoRepository();
//# sourceMappingURL=TodoRepository.js.map