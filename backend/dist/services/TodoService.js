"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoService = exports.TodoService = void 0;
const TodoRepository_1 = require("../repositories/TodoRepository");
const CategoryRepository_1 = require("../repositories/CategoryRepository");
class TodoService {
    async getAllTodos(userId) {
        const todos = await TodoRepository_1.todoRepository.findAll(userId);
        return await this.enrichTodosWithCategories(todos, userId);
    }
    async enrichTodosWithCategories(todos, userId) {
        // Sammle alle eindeutigen categoryIds
        const categoryIds = [...new Set(todos.map(t => t.categoryId).filter(id => id !== undefined))];
        // Lade alle benötigten Kategorien auf einmal
        const categories = new Map();
        for (const id of categoryIds) {
            const category = await CategoryRepository_1.categoryRepository.findById(id, userId);
            if (category) {
                categories.set(id, category);
            }
        }
        // Füge Category-Daten zu Todos hinzu
        return todos.map(todo => ({
            ...todo,
            category: todo.categoryId ? categories.get(todo.categoryId) : undefined
        }));
    }
    async getTodoById(id, userId) {
        const todo = await TodoRepository_1.todoRepository.findById(id, userId);
        if (!todo)
            return null;
        // Lade Category falls vorhanden
        if (todo.categoryId) {
            const category = await CategoryRepository_1.categoryRepository.findById(todo.categoryId, userId);
            return { ...todo, category: category ?? undefined };
        }
        return todo;
    }
    async createTodo(data, userId) {
        if (!data.title || data.title.trim() === "") {
            throw new Error("Title is required");
        }
        // Validiere categoryId falls angegeben
        if (data.categoryId) {
            const category = await CategoryRepository_1.categoryRepository.findById(data.categoryId, userId);
            if (!category) {
                throw new Error("Invalid category");
            }
        }
        // Check for duplicate
        const duplicate = await TodoRepository_1.todoRepository.findDuplicate(data.title, userId, data.description);
        if (duplicate) {
            throw new Error("A todo with this title already exists");
        }
        const todo = await TodoRepository_1.todoRepository.create(data, userId);
        // Lade Category falls vorhanden
        if (todo.categoryId) {
            const category = await CategoryRepository_1.categoryRepository.findById(todo.categoryId, userId);
            return { ...todo, category: category ?? undefined };
        }
        return todo;
    }
    async updateTodo(id, userId, data) {
        // Validiere categoryId falls angegeben
        if (data.categoryId !== undefined && data.categoryId !== null) {
            const category = await CategoryRepository_1.categoryRepository.findById(data.categoryId, userId);
            if (!category) {
                throw new Error("Invalid category");
            }
        }
        const todo = await TodoRepository_1.todoRepository.update(id, userId, data);
        if (!todo)
            return null;
        // Lade Category falls vorhanden
        if (todo.categoryId) {
            const category = await CategoryRepository_1.categoryRepository.findById(todo.categoryId, userId);
            return { ...todo, category: category ?? undefined };
        }
        return todo;
    }
    async toggleTodo(id, userId) {
        const todo = await TodoRepository_1.todoRepository.toggle(id, userId);
        if (!todo)
            return null;
        // Lade Category falls vorhanden
        if (todo.categoryId) {
            const category = await CategoryRepository_1.categoryRepository.findById(todo.categoryId, userId);
            return { ...todo, category: category ?? undefined };
        }
        return todo;
    }
    async deleteTodo(id, userId) {
        return await TodoRepository_1.todoRepository.delete(id, userId);
    }
}
exports.TodoService = TodoService;
exports.todoService = new TodoService();
//# sourceMappingURL=TodoService.js.map