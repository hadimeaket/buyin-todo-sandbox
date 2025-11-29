import { User } from "../models/User";
import db from "../db/sqlite";
import { v4 as uuidv4 } from "uuid";

export interface IUserRepository {
  create(data: { email: string; passwordHash: string; name?: string }): User;
  findByEmail(email: string): User | null;
  findById(id: string): User | null;
}

class UserRepository implements IUserRepository {
  create(data: { email: string; passwordHash: string; name?: string }): User {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.email, data.passwordHash, data.name || null, now, now);

    const user = this.findById(id);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  findByEmail(email: string): User | null {
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

    return row ? this.rowToUser(row) : null;
  }

  findById(id: string): User | null {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;

    return row ? this.rowToUser(row) : null;
  }

  private rowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const userRepository = new UserRepository();
