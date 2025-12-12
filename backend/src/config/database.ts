import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(config);

// Error handler for pool
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✓ Database connection successful");
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  console.log("Database pool closed");
}
