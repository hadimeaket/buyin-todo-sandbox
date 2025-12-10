import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/database";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(email: string, passwordHash: string): Promise<User>;
  delete(id: string): Promise<boolean>;
}

export class SqliteUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const stmt = db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToUser);
  }

  async findById(id: string): Promise<User | null> {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      createdAt: now,
    };

    const stmt = db.prepare(`
      INSERT INTO users (id, email, passwordHash, createdAt)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.passwordHash,
      user.createdAt.toISOString()
    );

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: new Date(row.createdAt),
    };
  }
}

export const userRepository = new SqliteUserRepository();
