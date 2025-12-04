/**
 * MongoDB Todo Repository Implementation
 *
 * Provides persistent storage for todos using MongoDB/Mongoose.
 * Implements the ITodoRepository interface with:
 * - Full CRUD operations
 * - Transaction support where needed
 * - Error handling and validation
 * - Query optimization
 */

import { ITodoRepository } from "./TodoRepository";
import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { TodoModel } from "../models/TodoSchema";
import mongoose from "mongoose";

export class MongoDBTodoRepository implements ITodoRepository {
  /**
   * Converts Mongoose document to plain Todo object
   */
  private toTodo(doc: any): Todo {
    const todo: Todo = {
      id: doc._id.toString(),
      userId: doc.userId?.toString() || doc.userId,
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      priority: doc.priority,
      dueDate: doc.dueDate,
      dueEndDate: doc.dueEndDate,
      isAllDay: doc.isAllDay,
      startTime: doc.startTime,
      endTime: doc.endTime,
      recurrence: doc.recurrence,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    // Add categoryId if present
    if (doc.categoryId) {
      todo.categoryId = doc.categoryId.toString();
    }

    // Add populated category if present
    if (
      doc.categoryId &&
      typeof doc.categoryId === "object" &&
      doc.categoryId._id
    ) {
      todo.category = {
        id: doc.categoryId._id.toString(),
        name: doc.categoryId.name,
        color: doc.categoryId.color,
      };
      todo.categoryId = doc.categoryId._id.toString();
    }

    // Add attachments if present
    if (doc.attachments) {
      todo.attachments = doc.attachments;
    }

    return todo;
  }

  /**
   * Retrieves all todos for a specific user, sorted by creation date (newest first)
   */
  async findAll(userId?: string): Promise<Todo[]> {
    try {
      const query = userId
        ? { userId: new mongoose.Types.ObjectId(userId) }
        : {};
      const docs = await TodoModel.find(query)
        .populate("categoryId", "name color")
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return docs.map((doc) => this.toTodo(doc as any));
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new Error("Failed to retrieve todos from database");
    }
  }

  /**
   * Finds a todo by ID
   */
  async findById(id: string): Promise<Todo | null> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await TodoModel.findById(id)
        .populate("categoryId", "name color")
        .exec();
      return doc ? this.toTodo(doc) : null;
    } catch (error) {
      console.error(`Error in findById for id ${id}:`, error);
      throw new Error("Failed to retrieve todo from database");
    }
  }

  /**
   * Finds duplicate todo by title and description
   */
  async findDuplicate(
    title: string,
    description?: string
  ): Promise<Todo | null> {
    try {
      const query: any = {
        title: { $regex: new RegExp(`^${this.escapeRegex(title)}$`, "i") },
      };

      if (description) {
        query.description = {
          $regex: new RegExp(`^${this.escapeRegex(description)}$`, "i"),
        };
      } else {
        // Match when description is undefined or empty
        query.$or = [
          { description: { $exists: false } },
          { description: null },
          { description: "" },
        ];
      }

      const doc = await TodoModel.findOne(query).exec();
      return doc ? this.toTodo(doc) : null;
    } catch (error) {
      console.error("Error in findDuplicate:", error);
      throw new Error("Failed to check for duplicate todo");
    }
  }

  /**
   * Helper to escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Creates a new todo
   */
  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    try {
      const todoData: any = {
        userId: new mongoose.Types.ObjectId(userId),
        title: data.title.trim(),
        description: data.description?.trim(),
        completed: false,
        priority: data.priority || "medium",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
        isAllDay: data.isAllDay ?? true,
        startTime: data.startTime,
        endTime: data.endTime,
        recurrence: data.recurrence || "none",
      };

      // Add categoryId if provided
      if (data.categoryId) {
        todoData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
      }

      const docs = await TodoModel.create([todoData]);
      const doc = docs[0];

      // Populate category before returning
      await doc.populate("categoryId", "name color");

      return this.toTodo(doc);
    } catch (error) {
      console.error("Error in create:", error);

      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${messages}`);
      }

      throw new Error("Failed to create todo in database");
    }
  }

  /**
   * Updates an existing todo
   */
  async update(id: string, data: UpdateTodoDto): Promise<Todo | null> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const updateData: any = {};

      // Only include fields that are provided
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined)
        updateData.description = data.description?.trim();
      if (data.completed !== undefined) updateData.completed = data.completed;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.isAllDay !== undefined) updateData.isAllDay = data.isAllDay;
      if (data.startTime !== undefined) updateData.startTime = data.startTime;
      if (data.endTime !== undefined) updateData.endTime = data.endTime;
      if (data.recurrence !== undefined)
        updateData.recurrence = data.recurrence;

      // Handle categoryId
      if (data.categoryId !== undefined) {
        updateData.categoryId = data.categoryId
          ? new mongoose.Types.ObjectId(data.categoryId)
          : null;
      }

      // Handle attachments
      if (data.attachments !== undefined) {
        updateData.attachments = data.attachments;
      }

      // Handle date fields explicitly
      if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
      }
      if (data.dueEndDate !== undefined) {
        updateData.dueEndDate = data.dueEndDate
          ? new Date(data.dueEndDate)
          : undefined;
      }

      const doc = await TodoModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true, // Return updated document
          runValidators: true, // Run schema validators
        }
      )
        .populate("categoryId", "name color")
        .exec();

      return doc ? this.toTodo(doc) : null;
    } catch (error) {
      console.error(`Error in update for id ${id}:`, error);

      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${messages}`);
      }

      throw new Error("Failed to update todo in database");
    }
  }

  /**
   * Toggles the completed status of a todo
   */
  async toggle(id: string): Promise<Todo | null> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await TodoModel.findById(id).exec();
      if (!doc) return null;

      doc.completed = !doc.completed;
      await doc.save();

      return this.toTodo(doc);
    } catch (error) {
      console.error(`Error in toggle for id ${id}:`, error);
      throw new Error("Failed to toggle todo status in database");
    }
  }

  /**
   * Deletes a todo by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await TodoModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error(`Error in delete for id ${id}:`, error);
      throw new Error("Failed to delete todo from database");
    }
  }
}
