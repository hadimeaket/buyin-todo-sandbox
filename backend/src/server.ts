import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { testConnection, closePool } from "./config/database";
import { runMigrations } from "./db/migrate";
import { seedDatabase } from "./db/seed";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    // Test database connection
    console.log("Testing database connection...");
    const connected = await testConnection();

    if (!connected) {
      console.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Run migrations
    await runMigrations();

    // Seed database if enabled
    if (process.env.SEED_DB === "true") {
      console.log("Seeding enabled, running seed script...");
      await seedDatabase();
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await closePool();
  process.exit(0);
});

startServer();

export default app;
