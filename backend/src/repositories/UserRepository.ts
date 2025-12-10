import { User, RegisterDto } from "../models/User";
import { getDatabase } from "../db/database";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDto): Promise<User>;
  delete(id: string): Promise<boolean>;
}

class SqliteUserRepository implements IUserRepository {
  private readonly SALT_ROUNDS = 10;

  private rowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(): Promise<User[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM users ORDER BY createdAt DESC")
      .all();
    return rows.map((row) => this.rowToUser(row));
  }

  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row ? this.rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    return row ? this.rowToUser(row) : null;
  }

  async create(data: RegisterDto): Promise<User> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.name, data.email, hashedPassword, now, now);

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

export const userRepository = new SqliteUserRepository();
