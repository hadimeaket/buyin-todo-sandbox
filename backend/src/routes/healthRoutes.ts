import { Router, Request, Response } from "express";

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
router.get("/ready", (_req: Request, res: Response) => {
  // Add checks for dependencies here (database, cache, etc.)
  const checks = {
    server: "ok",
    memory: process.memoryUsage(),
    // Add more dependency checks as needed
    // database: checkDatabaseConnection(),
    // redis: checkRedisConnection(),
  };

  const isReady = Object.values(checks).every(
    (check) => check === "ok" || typeof check === "object"
  );

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
