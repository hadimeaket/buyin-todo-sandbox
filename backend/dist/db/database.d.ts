import Database from "better-sqlite3";
/**
 * Initialize SQLite database connection and create schema
 */
export declare function initDatabase(): Database.Database;
/**
 * Get database instance (must call initDatabase first)
 */
export declare function getDatabase(): Database.Database;
/**
 * Close database connection
 */
export declare function closeDatabase(): void;
/**
 * Convert Date object to ISO string for storage
 */
export declare function dateToString(date: Date | undefined): string | null;
/**
 * Convert ISO string to Date object
 */
export declare function stringToDate(str: string | null | undefined): Date | undefined;
/**
 * Convert boolean to SQLite integer (0 or 1)
 */
export declare function boolToInt(value: boolean): number;
/**
 * Convert SQLite integer to boolean
 */
export declare function intToBool(value: number): boolean;
//# sourceMappingURL=database.d.ts.map