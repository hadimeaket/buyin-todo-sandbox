"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoService = exports.TodoService = void 0;
const SqliteTodoRepository_1 = require("../repositories/SqliteTodoRepository");
const todoRepository = new SqliteTodoRepository_1.SqliteTodoRepository();
class TodoService {
    async getAllTodos() {
        return await todoRepository.findAll();
    }
    async getTodoById(id) {
        return await todoRepository.findById(id);
    }
    async createTodo(data) {
        if (!data.title || data.title.trim() === "") {
            throw new Error("Title is required");
        }
        // Check for duplicate
        const duplicate = await todoRepository.findDuplicate(data.title, data.description);
        if (duplicate) {
            throw new Error("A todo with this title already exists");
        }
        return await todoRepository.create(data);
    }
    async updateTodo(id, data) {
        return await todoRepository.update(id, data);
    }
    async toggleTodo(id) {
        return await todoRepository.toggle(id);
    }
    async deleteTodo(id) {
        return await todoRepository.delete(id);
    }
}
exports.TodoService = TodoService;
exports.todoService = new TodoService();
//# sourceMappingURL=TodoService.js.map