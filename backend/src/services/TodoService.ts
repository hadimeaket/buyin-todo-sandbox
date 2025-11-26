import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";

export class TodoService {
  async getAllTodos(): Promise<Todo[]> {
    return await todoRepository.findAll();
  }

  async getTodoById(id: string): Promise<Todo | null> {
    return await todoRepository.findById(id);
  }

  async createTodo(data: CreateTodoDto): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Check for duplicate
    const duplicate = await todoRepository.findDuplicate(
      data.title,
      data.description
    );

    if (duplicate) {
      throw new Error("A todo with this title already exists");
    }

    return await todoRepository.create(data);
  }

  async updateTodo(id: string, data: UpdateTodoDto): Promise<Todo | null> {
    return await todoRepository.update(id, data);
  }

  async toggleTodo(id: string): Promise<Todo | null> {
    return await todoRepository.toggle(id);
  }

  async deleteTodo(id: string): Promise<boolean> {
    return await todoRepository.delete(id);
  }
}

export const todoService = new TodoService();
