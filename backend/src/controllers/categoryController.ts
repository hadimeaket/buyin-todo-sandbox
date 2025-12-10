import { Request, Response } from "express";
import { categoryService } from "../services/CategoryService";
import { AuthRequest } from "../middleware/authenticate";

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const categories = await categoryService.getAllCategories(userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const category = await categoryService.getCategoryById(
      req.params.id,
      userId
    );
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const category = await categoryService.createCategory(req.body, userId);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to create category" });
    }
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      userId,
      req.body
    );
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(category);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to update category" });
    }
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const deleted = await categoryService.deleteCategory(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};
