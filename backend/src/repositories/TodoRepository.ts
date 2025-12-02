import { Todo, CreateTodoDto, UpdateTodoDto, TodoAttachment } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
  addAttachment(todoId: string, userId: string, attachment: TodoAttachment): Promise<Todo | null>;
  removeAttachment(todoId: string, userId: string, attachmentId: string): Promise<Todo | null>;
}

class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];
  private dataFilePath: string;

  constructor() {
    // Store data in a persistent location
    this.dataFilePath = path.join(process.cwd(), "data", "todos.json");
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load todos from file if it exists
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, "utf-8");
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        this.todos = parsed.map((todo: any) => ({
          ...todo,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          dueEndDate: todo.dueEndDate ? new Date(todo.dueEndDate) : undefined,
          attachments: todo.attachments || [],
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        console.log(`Loaded ${this.todos.length} todos from persistent storage`);
      }
    } catch (error) {
      console.error("Error loading todos from file:", error);
      this.todos = [];
    }
  }

  private saveToFile(): void {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.todos, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving todos to file:", error);
    }
  }

  async findAll(userId: string): Promise<Todo[]> {
    return this.todos.filter((t) => t.userId === userId);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id && t.userId === userId);
    return todo || null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const duplicate = this.todos.find((t) => {
      const userMatch = t.userId === userId;
      const titleMatch =
        t.title.toLowerCase().trim() === title.toLowerCase().trim();
      const descMatch =
        !description ||
        t.description?.toLowerCase().trim() ===
          description.toLowerCase().trim();
      return userMatch && titleMatch && descMatch;
    });
    return duplicate || null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      userId: userId,
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority || "medium",
      category: data.category || "task",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
      isAllDay: data.isAllDay ?? true,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrence: data.recurrence || "none",
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    this.todos.push(todo);
    this.saveToFile();
    return todo;
  }

  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : undefined
          : this.todos[index].dueDate,
      dueEndDate:
        data.dueEndDate !== undefined
          ? data.dueEndDate
            ? new Date(data.dueEndDate)
            : undefined
          : this.todos[index].dueEndDate,
      isAllDay:
        data.isAllDay !== undefined
          ? data.isAllDay
          : this.todos[index].isAllDay,
      startTime:
        data.startTime !== undefined
          ? data.startTime
          : this.todos[index].startTime,
      endTime:
        data.endTime !== undefined ? data.endTime : this.todos[index].endTime,
      recurrence:
        data.recurrence !== undefined
          ? data.recurrence
          : this.todos[index].recurrence,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    this.saveToFile();
    return updatedTodo;
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      completed: !this.todos[index].completed,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    this.saveToFile();
    return updatedTodo;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return false;

    this.todos.splice(index, 1);
    this.saveToFile();
    return true;
  }

  async addAttachment(
    todoId: string,
    userId: string,
    attachment: TodoAttachment
  ): Promise<Todo | null> {
    const index = this.todos.findIndex(
      (t) => t.id === todoId && t.userId === userId
    );
    if (index === -1) return null;

    this.todos[index].attachments.push(attachment);
    this.todos[index].updatedAt = new Date();
    this.saveToFile();
    return this.todos[index];
  }

  async removeAttachment(
    todoId: string,
    userId: string,
    attachmentId: string
  ): Promise<Todo | null> {
    const index = this.todos.findIndex(
      (t) => t.id === todoId && t.userId === userId
    );
    if (index === -1) return null;

    const attachmentIndex = this.todos[index].attachments.findIndex(
      (a) => a.id === attachmentId
    );
    if (attachmentIndex === -1) return null;

    // Delete the physical file
    const attachment = this.todos[index].attachments[attachmentIndex];
    const uploadsDir = path.join(process.cwd(), "data", "uploads");
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    this.todos[index].attachments.splice(attachmentIndex, 1);
    this.todos[index].updatedAt = new Date();
    this.saveToFile();
    return this.todos[index];
  }
}

export const todoRepository = new InMemoryTodoRepository();
