import { Response } from "express";
import categoryService from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { AuthRequest } from "../middleware/auth";

export class CategoryController {
  async getAllCategories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const categories = categoryService.getAllCategories(req.userId!);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  }

  async getCategoryById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = categoryService.getCategoryById(
        req.params.id,
        req.userId!
      );
      res.json(category);
    } catch (error) {
      if (error instanceof Error && error.message === "Category not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to fetch category" });
      }
    }
  }

  async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateCategoryDto = req.body;

      if (!data.name || !data.color) {
        res.status(400).json({ message: "Name and color are required" });
        return;
      }

      const category = categoryService.createCategory(data, req.userId!);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes("Invalid HEX color")) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: "Failed to create category" });
        }
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  }

  async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: UpdateCategoryDto = req.body;
      const category = categoryService.updateCategory(
        req.params.id,
        req.userId!,
        data
      );
      res.json(category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Category not found") {
          res.status(404).json({ message: error.message });
        } else if (error.message.includes("already exists")) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes("Invalid HEX color")) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: "Failed to update category" });
        }
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  }

  async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      categoryService.deleteCategory(req.params.id, req.userId!);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Category not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete category" });
      }
    }
  }
}

export default new CategoryController();
