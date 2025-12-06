import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import type { CategoryService } from "../services/CategoryService";
import type { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  getAllCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId!;
      const categories = await this.categoryService.getAllCategories(userId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const category = await this.categoryService.getCategoryById(id, userId);

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId!;
      const data: CreateCategoryDto = req.body;
      const category = await this.categoryService.createCategory(data, userId);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("Invalid color") ||
          error.message.includes("required")
        ) {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      next(error);
    }
  };

  updateCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const data: UpdateCategoryDto = req.body;
      const category = await this.categoryService.updateCategory(
        id,
        data,
        userId
      );

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.json(category);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("Invalid color") ||
          error.message.includes("cannot be empty")
        ) {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      next(error);
    }
  };

  deleteCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const deleted = await this.categoryService.deleteCategory(id, userId);

      if (!deleted) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
