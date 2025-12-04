"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const CategoryRepository_1 = require("../repositories/CategoryRepository");
const TodoRepository_1 = require("../repositories/TodoRepository");
class CategoryService {
    constructor(repository) {
        this.repository = repository;
    }
    validateHexColor(color) {
        // Validiert HEX-Format: #RGB oder #RRGGBB
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }
    async getAllCategories(userId) {
        return this.repository.findAll(userId);
    }
    async getCategoryById(id, userId) {
        const category = await this.repository.findById(id, userId);
        if (!category) {
            throw new Error("Category not found");
        }
        return category;
    }
    async createCategory(data, userId) {
        // Validiere Name
        if (!data.name || data.name.trim().length === 0) {
            throw new Error("Category name is required");
        }
        if (data.name.trim().length > 50) {
            throw new Error("Category name cannot exceed 50 characters");
        }
        // Validiere HEX-Farbe
        if (!data.color) {
            throw new Error("Color is required");
        }
        if (!this.validateHexColor(data.color)) {
            throw new Error("Invalid HEX color format. Use #RGB or #RRGGBB");
        }
        // Prüfe auf Duplikat
        const existing = await this.repository.findByName(data.name, userId);
        if (existing) {
            throw new Error("Category with this name already exists");
        }
        return this.repository.create(data, userId);
    }
    async updateCategory(id, userId, data) {
        // Validiere Name falls angegeben
        if (data.name !== undefined) {
            if (data.name.trim().length === 0) {
                throw new Error("Category name cannot be empty");
            }
            if (data.name.trim().length > 50) {
                throw new Error("Category name cannot exceed 50 characters");
            }
            // Prüfe auf Duplikat (nur wenn Name geändert wird)
            const existing = await this.repository.findByName(data.name, userId);
            if (existing && existing.id !== id) {
                throw new Error("Category with this name already exists");
            }
        }
        // Validiere HEX-Farbe falls angegeben
        if (data.color !== undefined && !this.validateHexColor(data.color)) {
            throw new Error("Invalid HEX color format. Use #RGB or #RRGGBB");
        }
        const updated = await this.repository.update(id, userId, data);
        if (!updated) {
            throw new Error("Category not found");
        }
        return updated;
    }
    async deleteCategory(id, userId) {
        // Entferne Category-Zuweisung von allen Todos
        await TodoRepository_1.todoRepository.removeCategoryFromTodos(id, userId);
        const deleted = await this.repository.delete(id, userId);
        if (!deleted) {
            throw new Error("Category not found");
        }
    }
}
exports.categoryService = new CategoryService(CategoryRepository_1.categoryRepository);
//# sourceMappingURL=CategoryService.js.map