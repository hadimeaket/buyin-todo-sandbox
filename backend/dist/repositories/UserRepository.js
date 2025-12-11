"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
function rowToUser(row) {
    return {
        id: row.id,
        email: row.email,
        password: row.password,
        createdAt: new Date(row.createdAt),
    };
}
class SqliteUserRepository {
    async findAll() {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
        const rows = stmt.all();
        return rows.map(rowToUser);
    }
    async findById(id) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
        const row = stmt.get(id);
        return row ? rowToUser(row) : null;
    }
    async findByEmail(email) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
        const row = stmt.get(email);
        return row ? rowToUser(row) : null;
    }
    async create(data) {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        const id = (0, uuid_1.v4)();
        const stmt = db.prepare(`
      INSERT INTO users (id, email, password, createdAt)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(id, data.email, data.password, now);
        return (await this.findById(id));
    }
    async delete(id) {
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare("DELETE FROM users WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
exports.userRepository = new SqliteUserRepository();
//# sourceMappingURL=UserRepository.js.map