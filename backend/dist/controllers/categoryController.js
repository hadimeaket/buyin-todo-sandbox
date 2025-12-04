"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.CategoryController = void 0;
const CategoryService_1 = require("../services/CategoryService");
class CategoryController {
    constructor(service) {
        this.service = service;
        this.getAllCategories = async (req, res) => {
            try {
                const userId = req.session.userId;
                const categories = await this.service.getAllCategories(userId);
                res.status(200).json({
                    success: true,
                    count: categories.length,
                    data: categories,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch categories",
                });
            }
        };
        this.getCategoryById = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.session.userId;
                const category = await this.service.getCategoryById(id, userId);
                res.status(200).json({
                    success: true,
                    data: category,
                });
            }
            catch (error) {
                if (error.message === "Category not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to fetch category",
                    });
                }
            }
        };
        this.createCategory = async (req, res) => {
            try {
                const userId = req.session.userId;
                const data = req.body;
                const category = await this.service.createCategory(data, userId);
                res.status(201).json({
                    success: true,
                    data: category,
                });
            }
            catch (error) {
                // Validierungsfehler (HEX, Name, etc.)
                if (error.message.includes("required") ||
                    error.message.includes("Invalid") ||
                    error.message.includes("already exists") ||
                    error.message.includes("cannot exceed")) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to create category",
                    });
                }
            }
        };
        this.updateCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.session.userId;
                const data = req.body;
                const category = await this.service.updateCategory(id, userId, data);
                res.status(200).json({
                    success: true,
                    data: category,
                });
            }
            catch (error) {
                if (error.message === "Category not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
                else if (error.message.includes("Invalid") ||
                    error.message.includes("cannot") ||
                    error.message.includes("already exists")) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to update category",
                    });
                }
            }
        };
        this.deleteCategory = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.session.userId;
                await this.service.deleteCategory(id, userId);
                res.status(200).json({
                    success: true,
                    message: "Category deleted successfully",
                });
            }
            catch (error) {
                if (error.message === "Category not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to delete category",
                    });
                }
            }
        };
    }
}
exports.CategoryController = CategoryController;
exports.categoryController = new CategoryController(CategoryService_1.categoryService);
//# sourceMappingURL=categoryController.js.map