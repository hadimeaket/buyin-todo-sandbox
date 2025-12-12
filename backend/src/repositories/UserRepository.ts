import { pool } from "../config/database";
import { User, CreateUserDto } from "../models/User";

class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async findByProvider(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT * FROM users WHERE provider = $1 AND provider_id = $2",
      [provider, providerId]
    );
    return result.rows[0] || null;
  }

  async create(
    userData: CreateUserDto & { password_hash?: string }
  ): Promise<User> {
    const {
      email,
      password_hash = null,
      provider = "email",
      provider_id = null,
      name = null,
    } = userData;

    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, provider, provider_id, name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, password_hash, provider, provider_id, name]
    );

    return result.rows[0];
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query<User>(
      `UPDATE users SET ${fields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export default new UserRepository();
