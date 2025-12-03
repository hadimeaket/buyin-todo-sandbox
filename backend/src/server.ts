import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import ConnectSqlite3 from "connect-sqlite3";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { initDatabase } from "./db/database";
import path from "path";

dotenv.config();

// Initialize database
initDatabase();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Session store
const SQLiteStore = ConnectSqlite3(session);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: path.join(__dirname, "../data"),
    }) as any, // Type workaround for connect-sqlite3
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Custom cookie name
    cookie: {
      secure: false, // Set to false for local development (http)
      httpOnly: true,
      sameSite: "lax", // Important for cross-origin requests
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
