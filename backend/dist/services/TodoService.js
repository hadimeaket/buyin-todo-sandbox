"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoService = exports.TodoService = void 0;
const TodoRepository_1 = require("../repositories/TodoRepository");
class TodoService {
    async getAllTodos(userId) {
        return await TodoRepository_1.todoRepository.findAll(userId);
    }
    async getTodoById(id, userId) {
        return await TodoRepository_1.todoRepository.findById(id, userId);
    }
    async createTodo(data, userId) {
        if (!data.title || data.title.trim() === "") {
            throw new Error("Title is required");
        }
        // Check for duplicate
        const duplicate = await TodoRepository_1.todoRepository.findDuplicate(data.title, data.description, userId);
        if (duplicate) {
            throw new Error("A todo with this title already exists");
        }
        return await TodoRepository_1.todoRepository.create(data, userId);
    }
    async updateTodo(id, data, userId) {
        return await TodoRepository_1.todoRepository.update(id, data, userId);
    }
    async toggleTodo(id, userId) {
        return await TodoRepository_1.todoRepository.toggle(id, userId);
    }
    async deleteTodo(id, userId) {
        return await TodoRepository_1.todoRepository.delete(id, userId);
    }
}
exports.TodoService = TodoService;
exports.todoService = new TodoService();
//# sourceMappingURL=TodoService.js.map