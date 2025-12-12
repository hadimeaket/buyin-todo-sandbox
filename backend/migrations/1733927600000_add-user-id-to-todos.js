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
  // Add user_id column to todos table
  pgm.addColumns("todos", {
    user_id: {
      type: "uuid",
      notNull: false, // nullable initially for data migration
      references: "users",
      onDelete: "CASCADE",
    },
  });

  // Create index for user_id for faster queries
  pgm.createIndex("todos", "user_id");

  // Note: In production, you would:
  // 1. Create a default/system user if needed
  // 2. Update existing todos to assign them to that user
  // 3. Then make user_id NOT NULL with: pgm.alterColumn('todos', 'user_id', { notNull: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns("todos", ["user_id"]);
};
