import { Todo, CreateTodoDto, UpdateTodoDto } from '../models/Todo';
import { v4 as uuidv4 } from 'uuid';

export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(data: CreateTodoDto): Promise<Todo>;
  update(id: string, data: UpdateTodoDto): Promise<Todo | null>;
  toggle(id: string): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
}

class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async findAll(): Promise<Todo[]> {
    return [...this.todos];
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id);
    return todo || null;
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.push(todo);
    return todo;
  }

  async update(id: string, data: UpdateTodoDto): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      ...data,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    return updatedTodo;
  }

  async toggle(id: string): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      completed: !this.todos[index].completed,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    return updatedTodo;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.todos.splice(index, 1);
    return true;
  }
}

export const todoRepository = new InMemoryTodoRepository();
