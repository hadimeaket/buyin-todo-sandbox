import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";

export class TodoService {
  async getAllTodos(userId: string): Promise<Todo[]> {
    return await todoRepository.findAll(userId);
  }

  async getTodoById(id: string, userId: string): Promise<Todo | null> {
    return await todoRepository.findById(id, userId);
  }

  async createTodo(userId: string, data: CreateTodoDto): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Check for duplicate
    const duplicate = await todoRepository.findDuplicate(
      userId,
      data.title,
      data.description
    );

    if (duplicate) {
      throw new Error("A todo with this title already exists");
    }

    return await todoRepository.create(userId, data);
  }

  async updateTodo(
    id: string,
    userId: string,
    data: UpdateTodoDto
  ): Promise<Todo | null> {
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
