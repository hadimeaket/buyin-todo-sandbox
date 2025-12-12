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
  // Create users table
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      default: pgm.func("gen_random_uuid()"),
    },
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "varchar(255)",
      notNull: false, // null for SSO users
    },
    provider: {
      type: "varchar(20)",
      notNull: true,
      default: "email",
      check: "provider IN ('email', 'google', 'apple')",
    },
    provider_id: {
      type: "varchar(255)",
      notNull: false,
    },
    name: {
      type: "varchar(255)",
      notNull: false,
    },
    email_verified: {
      type: "boolean",
      notNull: true,
      default: false,
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
  pgm.createIndex("users", "email");
  pgm.createIndex("users", ["provider", "provider_id"]);

  // Create trigger to auto-update updated_at
  pgm.sql(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
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
  pgm.dropTable("users", { cascade: true });
};
