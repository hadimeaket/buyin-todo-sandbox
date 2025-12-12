import { Router, Request, Response } from "express";
import { pool } from "../config/database";

const router = Router();

// Liveness probe - checks if the application is running
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "todo-backend",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Readiness probe - checks if the application is ready to serve traffic
router.get("/ready", async (_req: Request, res: Response) => {
  // Check database connection
  let databaseStatus = "ok";
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch (error) {
    databaseStatus = "failed";
    console.error("Database health check failed:", error);
  }

  const checks = {
    server: "ok",
    database: databaseStatus,
    memory: process.memoryUsage(),
  };

  const isReady = databaseStatus === "ok";

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint for monitoring
router.get("/metrics", (_req: Request, res: Response) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
    // Add custom application metrics here
    // requestsTotal: getRequestCount(),
    // requestsPerSecond: getRequestRate(),
    // errorRate: getErrorRate(),
  };

  res.status(200).json(metrics);
});

export default router;
