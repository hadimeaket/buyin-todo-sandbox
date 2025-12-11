import { Response, NextFunction } from "express";
import { categoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { AuthRequest } from "../middleware/auth";

export const getAllCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const categories = categoryService.getAllCategories(userId);
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
    const userId = req.userId!;
    const { id } = req.params;
    const category = categoryService.getCategoryById(id, userId);

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
    const userId = req.userId!;
    const dto: CreateCategoryDto = req.body;
    const category = categoryService.createCategory(dto, userId);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const dto: UpdateCategoryDto = req.body;
    const category = categoryService.updateCategory(id, userId, dto);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const deleted = categoryService.deleteCategory(id, userId);

    if (!deleted) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
