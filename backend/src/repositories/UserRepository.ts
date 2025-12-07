import { User, CreateUserDto } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { getDb } from "../database/init";

const SALT_ROUNDS = 10;

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  verifyPassword(user: User, password: string): Promise<boolean>;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  is_verified: number;
  verification_token: string | null;
  token_expiry: string | null;
  created_at: string;
  updated_at: string;
}

const rowToUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  password_hash: row.password_hash,
  is_verified: Boolean(row.is_verified),
  verification_token: row.verification_token || undefined,
  token_expiry: row.token_expiry ? new Date(row.token_expiry) : undefined,
  created_at: new Date(row.created_at),
  updated_at: new Date(row.updated_at),
});

class SqliteUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const db = getDb();
    const now = new Date().toISOString();
    const id = uuidv4();

    // Hash password
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
    `);

    stmt.run(id, data.email.toLowerCase(), password_hash, now, now);

    const created = await this.findById(id);
    if (!created) throw new Error("Failed to create user");
    return created;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }
}

export const userRepository = new SqliteUserRepository();
