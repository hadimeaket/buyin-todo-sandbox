import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/database";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, data: UpdateTodoDto, userId: string): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

// Keeping InMemoryTodoRepository for testing or fallback purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async findAll(): Promise<Todo[]> {
    return [...this.todos];
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id);
    return todo || null;
  }

  async findDuplicate(
    title: string,
    description?: string
  ): Promise<Todo | null> {
    const duplicate = this.todos.find((t) => {
      const titleMatch =
        t.title.toLowerCase().trim() === title.toLowerCase().trim();
      const descMatch =
        !description ||
        t.description?.toLowerCase().trim() ===
          description.toLowerCase().trim();
      return titleMatch && descMatch;
    });
    return duplicate || null;
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority || "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
      isAllDay: data.isAllDay ?? true,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrence: data.recurrence || "none",
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

class PostgresTodoRepository implements ITodoRepository {
  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed,
      priority: row.priority,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      dueEndDate: row.due_end_date ? new Date(row.due_end_date) : undefined,
      isAllDay: row.is_all_day ?? true,
      startTime: row.start_time || undefined,
      endTime: row.end_time || undefined,
      recurrence: row.recurrence || "none",
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(userId: string): Promise<Todo[]> {
    const result = await pool.query(
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows.map((row) => this.mapRowToTodo(row));
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const result = await pool.query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToTodo(result.rows[0]);
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const query = description
      ? "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) AND LOWER(TRIM(description)) = LOWER(TRIM($2)) AND user_id = $3 LIMIT 1"
      : "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) AND description IS NULL AND user_id = $2 LIMIT 1";

    const params = description ? [title, description, userId] : [title, userId];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) return null;
    return this.mapRowToTodo(result.rows[0]);
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const id = uuidv4();
    const query = `
      INSERT INTO todos (
        id, title, description, completed, priority,
        due_date, due_end_date, is_all_day, start_time, end_time, recurrence, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      id,
      data.title,
      data.description || null,
      false,
      data.priority || "medium",
      data.dueDate || null,
      data.dueEndDate || null,
      data.isAllDay ?? true,
      data.startTime || null,
      data.endTime || null,
      data.recurrence || "none",
      userId,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToTodo(result.rows[0]);
  }

  async update(
    id: string,
    data: UpdateTodoDto,
    userId: string
  ): Promise<Todo | null> {
    // First check if todo exists
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }
    if (data.completed !== undefined) {
      updates.push(`completed = $${paramCount++}`);
      values.push(data.completed);
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(data.dueDate || null);
    }
    if (data.dueEndDate !== undefined) {
      updates.push(`due_end_date = $${paramCount++}`);
      values.push(data.dueEndDate || null);
    }
    if (data.isAllDay !== undefined) {
      updates.push(`is_all_day = $${paramCount++}`);
      values.push(data.isAllDay);
    }
    if (data.startTime !== undefined) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(data.startTime || null);
    }
    if (data.endTime !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(data.endTime || null);
    }
    if (data.recurrence !== undefined) {
      updates.push(`recurrence = $${paramCount++}`);
      values.push(data.recurrence);
    }

    if (updates.length === 0) return existing;

    values.push(id);
    values.push(userId);
    const query = `
      UPDATE todos
      SET ${updates.join(", ")}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.mapRowToTodo(result.rows[0]);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const result = await pool.query(
      "UPDATE todos SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToTodo(result.rows[0]);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const todoRepository = new PostgresTodoRepository();
