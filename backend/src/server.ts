import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { initDatabase, closeDatabase } from './db/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Initialize database
let db;
try {
  db = initDatabase();
  console.log('✓ Database initialized');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes - pass database to routes
app.use('/api', createRoutes(db));

// Error handling
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    closeDatabase();
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
