import { User, RegisterDto } from "../models/User";
import { getDatabase } from "../db/database";
import type Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDto): Promise<User>;
  delete(id: string): Promise<boolean>;
}

class SQLiteUserRepository implements IUserRepository {
  private getDb(): Database.Database {
    return getDatabase();
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

  async findById(id: string): Promise<User | null> {
    const stmt = this.getDb().prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id);
    return row ? this.rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = this.getDb().prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email.toLowerCase());
    return row ? this.rowToUser(row) : null;
  }

  async create(data: RegisterDto): Promise<User> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const stmt = this.getDb().prepare(`
      INSERT INTO users (id, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.email.toLowerCase(), hashedPassword, now, now);

    const user = await this.findById(id);
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.getDb().prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

// In-memory implementation for testing
class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  }

  async create(data: RegisterDto): Promise<User> {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user: User = {
      id: uuidv4(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.push(user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

export const userRepository =
  process.env.NODE_ENV === "test"
    ? new InMemoryUserRepository()
    : new SQLiteUserRepository();
