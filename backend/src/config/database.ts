/**
 * MongoDB Database Connection Module
 *
 * Provides robust connection handling with:
 * - Automatic retry logic with exponential backoff
 * - Connection pooling for optimal performance
 * - Graceful shutdown handling
 * - Comprehensive error logging
 */

import mongoose from "mongoose";

class Database {
  private retryAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 5000; // Initial delay in milliseconds
  private isConnected = false;

  /**
   * Establishes connection to MongoDB with retry logic
   */
  async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    // Mongoose connection options
    const options: mongoose.ConnectOptions = {
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 2,
      socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
      serverSelectionTimeoutMS:
        Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    };

    try {
      await mongoose.connect(mongoUri, options);
      this.isConnected = true;
      this.retryAttempts = 0;

      console.log("✓ MongoDB connected successfully");
      console.log(`  Database: ${mongoose.connection.name}`);
      console.log(`  Host: ${mongoose.connection.host}`);

      this.setupEventHandlers();
    } catch (error) {
      await this.handleConnectionError(error);
    }
  }

  /**
   * Handles connection errors with exponential backoff retry
   */
  private async handleConnectionError(error: unknown): Promise<void> {
    this.retryAttempts++;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `✗ MongoDB connection failed (Attempt ${this.retryAttempts}/${this.maxRetries}): ${errorMessage}`
    );

    if (this.retryAttempts < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff
      console.log(`  Retrying in ${delay / 1000} seconds...`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      await this.connect();
    } else {
      console.error(
        "✗ Max retry attempts reached. Could not connect to MongoDB."
      );
      throw new Error(
        `Failed to connect to MongoDB after ${this.maxRetries} attempts`
      );
    }
  }

  /**
   * Sets up event handlers for connection lifecycle
   */
  private setupEventHandlers(): void {
    // Connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB disconnected");
      this.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✓ MongoDB reconnected");
      this.isConnected = true;
    });

    mongoose.connection.on("error", (error) => {
      console.error("✗ MongoDB connection error:", error);
      this.isConnected = false;
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Gracefully disconnects from MongoDB
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log("✓ MongoDB connection closed gracefully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("✗ Error closing MongoDB connection:", errorMessage);
        throw error;
      }
    }
  }

  /**
   * Returns connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Returns mongoose connection instance
   */
  getConnection(): typeof mongoose.connection {
    return mongoose.connection;
  }
}

// Export singleton instance
export const database = new Database();
