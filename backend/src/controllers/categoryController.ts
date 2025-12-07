import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const categories = await categoryService.getAllCategories(userId);
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const category = await categoryService.getCategoryById(req.params.id, userId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const data: CreateCategoryDto = req.body;
    
    try {
      const category = await categoryService.createCategory(data, userId);
      res.status(201).json(category);
    } catch (err: any) {
      if (err.message === "Category name is required") {
        res.status(400).json({ message: err.message });
      } else if (err.message.includes("Invalid color format")) {
        res.status(400).json({ message: err.message });
      } else if (err.message === "A category with this name already exists") {
        res.status(409).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const data: UpdateCategoryDto = req.body;
    
    try {
      const category = await categoryService.updateCategory(req.params.id, userId, data);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(200).json(category);
    } catch (err: any) {
      if (err.message.includes("Invalid color format") || err.message.includes("cannot be empty")) {
        res.status(400).json({ message: err.message });
      } else if (err.message === "A category with this name already exists") {
        res.status(409).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const deleted = await categoryService.deleteCategory(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
