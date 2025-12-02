import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";

interface AuthRequest extends Request {
  userId?: string;
}

export const getAllCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const categories = categoryService.getAllCategories(req.userId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const category = categoryService.getCategoryById(req.params.id, req.userId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data: CreateCategoryDto = {
      name: req.body.name,
      color: req.body.color,
    };

    const category = categoryService.createCategory(data, req.userId);
    res.status(201).json(category);
  } catch (error: any) {
    if (
      error.message.includes("Invalid hex color") ||
      error.message.includes("required") ||
      error.message.includes("must be")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data: UpdateCategoryDto = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.color !== undefined) data.color = req.body.color;

    const category = categoryService.updateCategory(
      req.params.id,
      req.userId,
      data
    );
    res.json(category);
  } catch (error: any) {
    if (error.message === "Category not found") {
      res.status(404).json({ message: error.message });
    } else if (
      error.message.includes("Invalid hex color") ||
      error.message.includes("cannot be empty") ||
      error.message.includes("must be")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    categoryService.deleteCategory(req.params.id, req.userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "Category not found") {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
