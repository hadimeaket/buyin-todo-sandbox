import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";

const categoryService = new CategoryService();

/**
 * Get all categories for the authenticated user
 */
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const categories = categoryService.getAllCategories(userId);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const category = categoryService.getCategoryById(id, userId);

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const data: CreateCategoryDto = req.body;

    if (!data.name || !data.color) {
      res.status(400).json({ error: "Name and color are required" });
      return;
    }

    const category = categoryService.createCategory(data, userId);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (
        error.message.includes("Invalid hex color") ||
        error.message.includes("required") ||
        error.message.includes("must not exceed")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: "Failed to create category" });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const data: UpdateCategoryDto = req.body;

    const category = categoryService.updateCategory(id, data, userId);
    res.status(200).json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (
        error.message.includes("Invalid hex color") ||
        error.message.includes("required") ||
        error.message.includes("must not exceed")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: "Failed to update category" });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    categoryService.deleteCategory(id, userId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes("Cannot delete category")) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: "Failed to delete category" });
  }
};
