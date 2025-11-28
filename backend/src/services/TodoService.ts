import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";

export class TodoService {
  async getAllTodos(userId?: string): Promise<Todo[]> {
    return await todoRepository.findAll(userId);
  }

  async getTodoById(id: string, userId?: string): Promise<Todo | null> {
    return await todoRepository.findById(id, userId);
  }

  async createTodo(data: CreateTodoDto, userId?: string): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Check for duplicate
    const duplicate = await todoRepository.findDuplicate(
      data.title,
      data.description,
      userId
    );

    if (duplicate) {
      throw new Error("A todo with this title already exists");
    }

    return await todoRepository.create(data, userId);
  }

  async updateTodo(id: string, data: UpdateTodoDto, userId?: string): Promise<Todo | null> {
    return await todoRepository.update(id, data, userId);
  }

  async toggleTodo(id: string, userId?: string): Promise<Todo | null> {
    return await todoRepository.toggle(id, userId);
  }

  async deleteTodo(id: string, userId?: string): Promise<boolean> {
    return await todoRepository.delete(id, userId);
  }
}

export const todoService = new TodoService();
