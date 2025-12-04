import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";
import { categoryService } from "./CategoryService";

export class TodoService {
  async getAllTodos(userId: string): Promise<Todo[]> {
    return await todoRepository.findAll(userId);
  }

  async getTodoById(id: string, userId: string): Promise<Todo | null> {
    const todo = await todoRepository.findById(id);

    // Ensure user can only access their own todos
    if (todo && todo.userId !== userId) {
      return null;
    }

    return todo;
  }

  async createTodo(data: CreateTodoDto, userId: string): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Validate category ownership if categoryId provided
    if (data.categoryId) {
      const isValid = await categoryService.validateCategoryOwnership(
        data.categoryId,
        userId
      );
      if (!isValid) {
        throw new Error("Category not found or does not belong to you");
      }
    }

    // Check for duplicate (within user's todos)
    const duplicate = await todoRepository.findDuplicate(
      data.title,
      data.description
    );

    if (duplicate && duplicate.userId === userId) {
      throw new Error("A todo with this title already exists");
    }

    return await todoRepository.create(data, userId);
  }

  async updateTodo(
    id: string,
    data: UpdateTodoDto,
    userId: string
  ): Promise<Todo | null> {
    // Verify ownership before update
    const todo = await this.getTodoById(id, userId);
    if (!todo) {
      return null;
    }

    // Validate category ownership if categoryId provided
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const isValid = await categoryService.validateCategoryOwnership(
        data.categoryId,
        userId
      );
      if (!isValid) {
        throw new Error("Category not found or does not belong to you");
      }
    }

    return await todoRepository.update(id, data);
  }

  async toggleTodo(id: string, userId: string): Promise<Todo | null> {
    // Verify ownership before toggle
    const todo = await this.getTodoById(id, userId);
    if (!todo) {
      return null;
    }

    return await todoRepository.toggle(id);
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    // Verify ownership before delete
    const todo = await this.getTodoById(id, userId);
    if (!todo) {
      return false;
    }

    return await todoRepository.delete(id);
  }
}

export const todoService = new TodoService();
