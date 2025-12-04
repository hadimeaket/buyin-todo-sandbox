import { User } from "../models/User";
import { db } from "../database/db";

export interface IUserRepository {
  findByEmail(email: string): User | null;
  findById(id: string): User | null;
  create(user: User): User;
  clear(): void;
}

export class UserRepository implements IUserRepository {
  findByEmail(email: string): User | null {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as any;
    return row ? this.rowToUser(row) : null;
  }

  findById(id: string): User | null {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.rowToUser(row) : null;
  }

  create(user: User): User {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, passwordHash, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.passwordHash,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );

    return user;
  }

  clear(): void {
    db.prepare("DELETE FROM users").run();
  }

  private rowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export const userRepository = new UserRepository();
