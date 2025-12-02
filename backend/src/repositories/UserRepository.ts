import { User, CreateUserDto } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

interface UserRow {
  id: string;
  email: string;
  password: string | null;
  provider: "local" | "google" | "apple";
  providerId: string | null;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password || undefined,
    provider: row.provider,
    providerId: row.providerId || undefined,
    name: row.name || undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

class SqliteUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
    const rows = stmt.all() as UserRow[];
    return rows.map(rowToUser);
  }

  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findByProvider(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM users WHERE provider = ? AND providerId = ?"
    );
    const row = stmt.get(provider, providerId) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO users (
        id, email, password, provider, providerId, name, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.email,
      data.password || null,
      data.provider || "local",
      data.providerId || null,
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

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.password !== undefined) {
      updates.push("password = ?");
      values.push(data.password || null);
    }
    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name || null);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
    );
    stmt.run(...values);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userRepository = new SqliteUserRepository();
