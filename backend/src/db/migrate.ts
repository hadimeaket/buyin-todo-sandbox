import { pool } from "../config/database";
import { readFileSync } from "fs";
import { join } from "path";

export async function runMigrations(): Promise<void> {
  try {
    console.log("Running database migrations...");

    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if todos table migration has been run
    const migrationCheck = await pool.query(
      "SELECT * FROM migrations WHERE name = $1",
      ["create-todos-table"]
    );

    if (migrationCheck.rows.length > 0) {
      console.log("✓ Migrations already applied");
      return;
    }

    // Run the todos table migration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id uuid PRIMARY KEY NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        completed boolean NOT NULL DEFAULT false,
        priority varchar(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date timestamp with time zone,
        due_end_date timestamp with time zone,
        is_all_day boolean DEFAULT false,
        start_time varchar(10),
        end_time varchar(10),
        recurrence varchar(50),
        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at)"
    );

    // Create trigger function for auto-updating updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS update_todos_updated_at ON todos
    `);

    await pool.query(`
      CREATE TRIGGER update_todos_updated_at
      BEFORE UPDATE ON todos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    // Record migration as complete
    await pool.query(
      "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["create-todos-table"]
    );

    console.log("✓ Migrations completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  }
}
