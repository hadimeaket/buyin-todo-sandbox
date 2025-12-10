import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

/**
 * DatabaseConnection - Singleton für SQLite Datenbankverbindung
 * 
 * Implementiert Singleton Pattern für zentrale DB-Verwaltung
 */
class DatabaseConnection {
  private static instance: Database.Database | null = null;
  private static dbPath: string;

  /**
   * Initialisiert die Datenbankverbindung
   * @param dbPath Pfad zur SQLite-Datenbankdatei
   */
  public static initialize(dbPath?: string): Database.Database {
    if (!DatabaseConnection.instance) {
      // Standard-Pfad: data/todos.db
      DatabaseConnection.dbPath = dbPath || path.join(process.cwd(), "data", "todos.db");

      // Stelle sicher, dass das data-Verzeichnis existiert
      const dir = path.dirname(DatabaseConnection.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Öffne Datenbankverbindung
      DatabaseConnection.instance = new Database(DatabaseConnection.dbPath);
      
      // Aktiviere Foreign Keys
      DatabaseConnection.instance.pragma("foreign_keys = ON");

      console.log(`✅ SQLite database connected: ${DatabaseConnection.dbPath}`);
    }

    return DatabaseConnection.instance;
  }

  /**
   * Gibt die bestehende Datenbankverbindung zurück
   */
  public static getConnection(): Database.Database {
    if (!DatabaseConnection.instance) {
      return DatabaseConnection.initialize();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Schließt die Datenbankverbindung
   */
  public static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
      console.log("🔌 Database connection closed");
    }
  }

  /**
   * Gibt den Dateipfad der Datenbank zurück
   */
  public static getDbPath(): string {
    return DatabaseConnection.dbPath;
  }
}

export default DatabaseConnection;
