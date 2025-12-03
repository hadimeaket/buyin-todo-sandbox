import { ITodoRepository } from "../repositories/TodoRepository";
import { SqliteTodoRepository } from "../repositories/SqliteTodoRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";

let todoRepository: ITodoRepository | null = null;

function getTodoRepository(): ITodoRepository {
  if (!todoRepository) {
    todoRepository = new SqliteTodoRepository();
  }
  return todoRepository;
}

export class TodoService {
  async getAllTodos(userId?: number): Promise<Todo[]> {
    return await getTodoRepository().findAll(userId);
  }

  async getTodoById(id: string, userId?: number): Promise<Todo | null> {
    return await getTodoRepository().findById(id, userId);
  }

  async createTodo(data: CreateTodoDto, userId?: number): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Check for duplicate
    const duplicate = await getTodoRepository().findDuplicate(
      data.title,
      data.description,
      userId
    );

    if (duplicate) {
      throw new Error("A todo with this title already exists");
    }

    return await getTodoRepository().create(data, userId);
  }

  async updateTodo(
    id: string,
    data: UpdateTodoDto,
    userId?: number
  ): Promise<Todo | null> {
    return await getTodoRepository().update(id, data, userId);
  }

  async toggleTodo(id: string, userId?: number): Promise<Todo | null> {
    return await getTodoRepository().toggle(id, userId);
  }

  async deleteTodo(id: string, userId?: number): Promise<boolean> {
    return await getTodoRepository().delete(id, userId);
  }
}

export const todoService = new TodoService();
