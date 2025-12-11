import { User, RegisterUserDto } from "../models/User";
import { getDatabase } from "../db";
import { v4 as uuidv4 } from "uuid";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterUserDto & { password: string }): Promise<User>;
  delete(id: string): Promise<boolean>;
}

interface UserRow {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    createdAt: new Date(row.createdAt),
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

  async create(data: RegisterUserDto & { password: string }): Promise<User> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, createdAt)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, data.email, data.password, now);

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userRepository = new SqliteUserRepository();
