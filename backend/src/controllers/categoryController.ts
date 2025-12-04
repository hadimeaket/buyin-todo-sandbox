import { Request, Response } from "express";
import { categoryService, ICategoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";

export class CategoryController {
  constructor(private service: ICategoryService) {}

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.session!.userId!;
      const categories = await this.service.getAllCategories(userId);

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.session!.userId!;

      const category = await this.service.getCategoryById(id, userId);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      if (error.message === "Category not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to fetch category",
        });
      }
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.session!.userId!;
      const data: CreateCategoryDto = req.body;

      const category = await this.service.createCategory(data, userId);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      // Validierungsfehler (HEX, Name, etc.)
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid") ||
        error.message.includes("already exists") ||
        error.message.includes("cannot exceed")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to create category",
        });
      }
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.session!.userId!;
      const data: UpdateCategoryDto = req.body;

      const category = await this.service.updateCategory(id, userId, data);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      if (error.message === "Category not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (
        error.message.includes("Invalid") ||
        error.message.includes("cannot") ||
        error.message.includes("already exists")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to update category",
        });
      }
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.session!.userId!;

      await this.service.deleteCategory(id, userId);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Category not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete category",
        });
      }
    }
  };
}

export const categoryController = new CategoryController(categoryService);
