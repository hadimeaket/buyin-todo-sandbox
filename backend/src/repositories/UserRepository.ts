import { User, CreateUserDto } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import DatabaseConnection from "../database/connection";
import type Database from "better-sqlite3";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto & { passwordHash: string }): Promise<User>;
  delete(id: string): Promise<boolean>;
}

/**
 * UserRepository - Benutzer-Verwaltung mit SQLite
 * 
 * Verwendet Prepared Statements für SQL Injection Prevention
 */
class SQLiteUserRepository implements IUserRepository {
  private get db(): Database.Database {
    return DatabaseConnection.getConnection();
  }

  /**
   * Konvertiert DB-Row zu User-Objekt mit korrekten Datentypen
   */
  private rowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(): Promise<User[]> {
    const stmt = this.db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
    const rows = stmt.all();
    return rows.map((row) => this.rowToUser(row));
  }

  async findById(id: string): Promise<User | null> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id);
    return row ? this.rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email.toLowerCase());
    return row ? this.rowToUser(row) : null;
  }

  async create(data: CreateUserDto & { passwordHash: string }): Promise<User> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, passwordHash, name, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.email.toLowerCase(),
      data.passwordHash,
      data.name || null,
      now,
      now
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Failed to create user");
    }
    return created;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userRepository = new SQLiteUserRepository();
