/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create todos table
  pgm.createTable("todos", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
      notNull: false,
    },
    completed: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    priority: {
      type: "varchar(10)",
      notNull: true,
      default: "medium",
      check: "priority IN ('low', 'medium', 'high')",
    },
    due_date: {
      type: "timestamp with time zone",
      notNull: false,
    },
    due_end_date: {
      type: "timestamp with time zone",
      notNull: false,
    },
    is_all_day: {
      type: "boolean",
      notNull: false,
      default: false,
    },
    start_time: {
      type: "varchar(10)",
      notNull: false,
    },
    end_time: {
      type: "varchar(10)",
      notNull: false,
    },
    recurrence: {
      type: "varchar(50)",
      notNull: false,
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // Create indexes for common queries
  pgm.createIndex("todos", "completed");
  pgm.createIndex("todos", "due_date");
  pgm.createIndex("todos", "priority");
  pgm.createIndex("todos", "created_at");

  // Create function to auto-update updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger to auto-update updated_at
  pgm.sql(`
    CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("todos", { cascade: true });
  pgm.sql("DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;");
};
