import { todoRepository } from "../repositories/TodoRepository";
import { categoryRepository } from "../repositories/CategoryRepository";
import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";
import { Category } from "../models/Category";

export interface TodoWithCategory extends Todo {
  category?: Category;
}

export class TodoService {
  async getAllTodos(userId: string): Promise<TodoWithCategory[]> {
    const todos = await todoRepository.findAll(userId);
    return await this.enrichTodosWithCategories(todos, userId);
  }

  private async enrichTodosWithCategories(
    todos: Todo[],
    userId: string
  ): Promise<TodoWithCategory[]> {
    // Sammle alle eindeutigen categoryIds
    const categoryIds = [
      ...new Set(
        todos
          .map((t) => t.categoryId)
          .filter((id) => id !== undefined) as string[]
      ),
    ];

    // Lade alle benötigten Kategorien auf einmal
    const categories = new Map<string, Category>();
    for (const id of categoryIds) {
      const category = await categoryRepository.findById(id, userId);
      if (category) {
        categories.set(id, category);
      }
    }

    // Füge Category-Daten zu Todos hinzu
    return todos.map((todo) => ({
      ...todo,
      category: todo.categoryId ? categories.get(todo.categoryId) : undefined,
    }));
  }

  async getTodoById(
    id: string,
    userId: string
  ): Promise<TodoWithCategory | null> {
    const todo = await todoRepository.findById(id, userId);
    if (!todo) return null;

    // Lade Category falls vorhanden
    if (todo.categoryId) {
      const category = await categoryRepository.findById(
        todo.categoryId,
        userId
      );
      return { ...todo, category: category ?? undefined };
    }

    return todo;
  }

  async createTodo(
    data: CreateTodoDto,
    userId: string
  ): Promise<TodoWithCategory> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Validiere categoryId falls angegeben
    if (data.categoryId) {
      const category = await categoryRepository.findById(
        data.categoryId,
        userId
      );
      if (!category) {
        throw new Error("Invalid category");
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

    const todo = await todoRepository.create(data, userId);

    // Lade Category falls vorhanden
    if (todo.categoryId) {
      const category = await categoryRepository.findById(
        todo.categoryId,
        userId
      );
      return { ...todo, category: category ?? undefined };
    }

    return todo;
  }

  async updateTodo(
    id: string,
    userId: string,
    data: UpdateTodoDto
  ): Promise<TodoWithCategory | null> {
    // Validiere categoryId falls angegeben
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const category = await categoryRepository.findById(
        data.categoryId,
        userId
      );
      if (!category) {
        throw new Error("Invalid category");
      }
    }

    const todo = await todoRepository.update(id, userId, data);
    if (!todo) return null;

    // Lade Category falls vorhanden
    if (todo.categoryId) {
      const category = await categoryRepository.findById(
        todo.categoryId,
        userId
      );
      return { ...todo, category: category ?? undefined };
    }

    return todo;
  }

  async toggleTodo(
    id: string,
    userId: string
  ): Promise<TodoWithCategory | null> {
    const todo = await todoRepository.toggle(id, userId);
    if (!todo) return null;

    // Lade Category falls vorhanden
    if (todo.categoryId) {
      const category = await categoryRepository.findById(
        todo.categoryId,
        userId
      );
      return { ...todo, category: category ?? undefined };
    }

    return todo;
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    return await todoRepository.delete(id, userId);
  }
}

export const todoService = new TodoService();
