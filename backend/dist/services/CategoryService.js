"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const CategoryRepository_1 = require("../repositories/CategoryRepository");
class CategoryService {
    getAllCategories(userId) {
        return CategoryRepository_1.categoryRepository.findAllByUserId(userId);
    }
    getCategoryById(id, userId) {
        return CategoryRepository_1.categoryRepository.findById(id, userId);
    }
    createCategory(dto, userId) {
        // Validate color format (hex color)
        if (!dto.color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Invalid color format. Use hex color (e.g., #FF5733)');
        }
        if (!dto.name || dto.name.trim().length === 0) {
            throw new Error('Category name is required');
        }
        return CategoryRepository_1.categoryRepository.create(dto, userId);
    }
    updateCategory(id, userId, dto) {
        if (dto.color && !dto.color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Invalid color format. Use hex color (e.g., #FF5733)');
        }
        if (dto.name !== undefined && dto.name.trim().length === 0) {
            throw new Error('Category name cannot be empty');
        }
        return CategoryRepository_1.categoryRepository.update(id, userId, dto);
    }
    deleteCategory(id, userId) {
        return CategoryRepository_1.categoryRepository.delete(id, userId);
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
//# sourceMappingURL=CategoryService.js.map