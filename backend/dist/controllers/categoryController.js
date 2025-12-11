"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const CategoryService_1 = require("../services/CategoryService");
const getAllCategories = async (req, res, next) => {
    try {
        const userId = req.userId;
        const categories = CategoryService_1.categoryService.getAllCategories(userId);
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const category = CategoryService_1.categoryService.getCategoryById(id, userId);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const dto = req.body;
        const category = CategoryService_1.categoryService.createCategory(dto, userId);
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const dto = req.body;
        const category = CategoryService_1.categoryService.updateCategory(id, userId, dto);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const deleted = CategoryService_1.categoryService.deleteCategory(id, userId);
        if (!deleted) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map