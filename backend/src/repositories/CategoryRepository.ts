/**
 * Category Repository
 *
 * Handles database operations for Category entity
 */

import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { CategoryModel } from "../models/CategorySchema";

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  findByName(name: string, userId: string): Promise<Category | null>;
  create(data: CreateCategoryDto, userId: string): Promise<Category>;
  update(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null>;
  delete(id: string, userId: string): Promise<boolean>;
  countTodosWithCategory(categoryId: string): Promise<number>;
}

export class CategoryRepository implements ICategoryRepository {
  /**
   * Convert Mongoose document to plain Category object
   */
  private toCategory(doc: any): Category {
    return {
      id: doc._id.toString(),
      name: doc.name,
      color: doc.color,
      userId: doc.userId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Get all categories for a user
   */
  async findAll(userId: string): Promise<Category[]> {
    try {
      const docs = await CategoryModel.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
      return docs.map((doc) => this.toCategory(doc));
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Find category by ID and verify ownership
   */
  async findById(id: string, userId: string): Promise<Category | null> {
    try {
      const doc = await CategoryModel.findOne({ _id: id, userId }).exec();
      return doc ? this.toCategory(doc) : null;
    } catch (error) {
      console.error(`Error in findById for id ${id}:`, error);
      return null;
    }
  }

  /**
   * Find category by name for a user
   */
  async findByName(name: string, userId: string): Promise<Category | null> {
    try {
      const doc = await CategoryModel.findOne({
        name: name.trim(),
        userId,
      }).exec();
      return doc ? this.toCategory(doc) : null;
    } catch (error) {
      console.error("Error in findByName:", error);
      return null;
    }
  }

  /**
   * Create new category
   */
  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    try {
      const categoryData = {
        name: data.name.trim(),
        color: data.color.toUpperCase(), // Normalize to uppercase
        userId,
      };

      const docs = await CategoryModel.create([categoryData]);
      return this.toCategory(docs[0]);
    } catch (error: any) {
      console.error("Error in create:", error);

      if (error.code === 11000) {
        throw new Error("Category with this name already exists");
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(messages);
      }

      throw new Error("Failed to create category");
    }
  }

  /**
   * Update category
   */
  async update(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null> {
    try {
      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }

      if (data.color !== undefined) {
        updateData.color = data.color.toUpperCase();
      }

      const doc = await CategoryModel.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
      ).exec();

      return doc ? this.toCategory(doc) : null;
    } catch (error: any) {
      console.error(`Error in update for id ${id}:`, error);

      if (error.code === 11000) {
        throw new Error("Category with this name already exists");
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(messages);
      }

      throw new Error("Failed to update category");
    }
  }

  /**
   * Delete category
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await CategoryModel.deleteOne({ _id: id, userId }).exec();
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error in delete for id ${id}:`, error);
      throw new Error("Failed to delete category");
    }
  }

  /**
   * Count how many todos use this category
   */
  async countTodosWithCategory(categoryId: string): Promise<number> {
    try {
      const { TodoModel } = await import("../models/TodoSchema");
      const count = await TodoModel.countDocuments({ categoryId }).exec();
      return count;
    } catch (error) {
      console.error("Error counting todos with category:", error);
      return 0;
    }
  }
}

export const categoryRepository = new CategoryRepository();
