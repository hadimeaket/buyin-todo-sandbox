"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const uuid_1 = require("uuid");
const TodoRepository_1 = require("./TodoRepository");
class SqliteUserRepository {
    getDb() {
        return TodoRepository_1.todoRepository.getDatabase();
    }
    async findAll() {
        const rows = this.getDb().prepare("SELECT * FROM users").all();
        return rows.map((row) => this.rowToUser(row));
    }
    async findById(id) {
        const row = this.getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
        return row ? this.rowToUser(row) : null;
    }
    async findByEmail(email) {
        const row = this.getDb()
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(email);
        return row ? this.rowToUser(row) : null;
    }
    async create(data) {
        const now = new Date();
        const user = {
            id: (0, uuid_1.v4)(),
            email: data.email,
            password: data.password, // Password should already be hashed by the service
            createdAt: now,
            updatedAt: now,
        };
        const stmt = this.getDb().prepare(`
      INSERT INTO users (id, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(user.id, user.email, user.password, user.createdAt.toISOString(), user.updatedAt.toISOString());
        return user;
    }
    async delete(id) {
        const stmt = this.getDb().prepare("DELETE FROM users WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
    rowToUser(row) {
        return {
            id: row.id,
            email: row.email,
            password: row.password,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
    toUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.userRepository = new SqliteUserRepository();
//# sourceMappingURL=UserRepository.js.map