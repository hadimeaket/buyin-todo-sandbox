import DatabaseConnection from "./connection";

/**
 * Initialisiert das Datenbankschema
 * 
 * Erstellt alle notwendigen Tabellen für die TODO-App
 */
export function initializeSchema(): void {
  const db = DatabaseConnection.getConnection();

  // Erstelle TODOs Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      dueDate TEXT,
      dueEndDate TEXT,
      isAllDay INTEGER DEFAULT 1,
      startTime TEXT,
      endTime TEXT,
      recurrence TEXT DEFAULT 'none',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      CHECK (completed IN (0, 1)),
      CHECK (priority IN ('low', 'medium', 'high')),
      CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
      CHECK (isAllDay IN (0, 1))
    )
  `);

  console.log("✅ Database schema initialized");
}

/**
 * Löscht alle Daten aus der Datenbank (für Tests)
 */
export function clearDatabase(): void {
  const db = DatabaseConnection.getConnection();
  db.exec("DELETE FROM todos");
  console.log("🗑️  Database cleared");
}

/**
 * Setzt die Datenbank komplett zurück (für Tests)
 */
export function resetDatabase(): void {
  const db = DatabaseConnection.getConnection();
  db.exec("DROP TABLE IF EXISTS todos");
  initializeSchema();
  console.log("🔄 Database reset complete");
}
