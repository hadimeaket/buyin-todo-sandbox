/**
 * Category Controller
 *
 * HTTP request handlers for category endpoints
 */

import { Request, Response } from "express";
import { categoryService } from "../services/CategoryService";

/**
 * GET /api/categories
 * Get all categories for authenticated user
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const categories = await categoryService.getAllCategories(userId);
    res.status(200).json(categories);
  } catch (error: any) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/**
 * GET /api/categories/:id
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, userId);
    res.status(200).json(category);
  } catch (error: any) {
    console.error("Error in getCategoryById:", error);

    if (error.message === "Category not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  }
};

/**
 * POST /api/categories
 * Create new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, color } = req.body;

    if (!name || !color) {
      res.status(400).json({ message: "Name and color are required" });
      return;
    }

    const category = await categoryService.createCategory(
      { name, color },
      userId
    );
    res.status(201).json(category);
  } catch (error: any) {
    console.error("Error in createCategory:", error);

    if (error.message.includes("already exists")) {
      res.status(409).json({ message: error.message });
    } else if (
      error.message.includes("HEX color") ||
      error.message.includes("between 1 and 50")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to create category" });
    }
  }
};

/**
 * PUT /api/categories/:id
 * Update category
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name && !color) {
      res
        .status(400)
        .json({ message: "At least one field (name or color) is required" });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const category = await categoryService.updateCategory(
      id,
      updateData,
      userId
    );
    res.status(200).json(category);
  } catch (error: any) {
    console.error("Error in updateCategory:", error);

    if (error.message === "Category not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("already exists")) {
      res.status(409).json({ message: error.message });
    } else if (
      error.message.includes("HEX color") ||
      error.message.includes("between 1 and 50")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to update category" });
    }
  }
};

/**
 * DELETE /api/categories/:id
 * Delete category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await categoryService.deleteCategory(id, userId);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteCategory:", error);

    if (error.message === "Category not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("Cannot delete category")) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to delete category" });
    }
  }
};
