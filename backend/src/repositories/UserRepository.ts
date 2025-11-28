import { User, RegisterDto, UserResponse } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { todoRepository } from "./TodoRepository";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDto): Promise<User>;
  delete(id: string): Promise<boolean>;
}

class SqliteUserRepository implements IUserRepository {
  private getDb() {
    return (todoRepository as any).getDatabase();
  }

  async findAll(): Promise<User[]> {
    const rows = this.getDb().prepare("SELECT * FROM users").all();
    return rows.map((row: any) => this.rowToUser(row));
  }

  async findById(id: string): Promise<User | null> {
    const row = this.getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row ? this.rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = this.getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    return row ? this.rowToUser(row) : null;
  }

  async create(data: RegisterDto): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: data.email,
      password: data.password, // Password should already be hashed by the service
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.getDb().prepare(`
      INSERT INTO users (id, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.password,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.getDb().prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private rowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userRepository = new SqliteUserRepository();
