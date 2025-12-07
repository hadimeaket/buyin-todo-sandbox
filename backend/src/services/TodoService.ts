import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";

export class TodoService {
  async getAllTodos(userId: string): Promise<Todo[]> {
    return await todoRepository.findAll(userId);
  }

  async getTodoById(id: string, userId: string): Promise<Todo | null> {
    return await todoRepository.findById(id, userId);
  }

  async createTodo(data: CreateTodoDto, userId: string): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Validate date range
    if (data.dueDate && data.dueEndDate) {
      const startDate = new Date(data.dueDate);
      const endDate = new Date(data.dueEndDate);
      if (endDate < startDate) {
        throw new Error("End date must be greater than or equal to start date");
      }
    }

    // Check for duplicate
    const duplicate = await todoRepository.findDuplicate(
      data.title,
      userId,
      data.description
    );

    if (duplicate) {
      throw new Error("A todo with this title already exists");
    }

    return await todoRepository.create(data, userId);
  }

  async updateTodo(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    // Validate date range if both dates are provided
    if (data.dueDate && data.dueEndDate) {
      const startDate = new Date(data.dueDate);
      const endDate = new Date(data.dueEndDate);
      if (endDate < startDate) {
        throw new Error("End date must be greater than or equal to start date");
      }
    }

    return await todoRepository.update(id, userId, data);
  }

  async toggleTodo(id: string, userId: string): Promise<Todo | null> {
    return await todoRepository.toggle(id, userId);
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    return await todoRepository.delete(id, userId);
  }
}

export const todoService = new TodoService();
