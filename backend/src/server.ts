import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { database } from "./config/database";

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

/**
 * Initialize database connection and start server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    console.log("Initializing database connection...");
    await database.connect();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`  API available at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();

export default app;
