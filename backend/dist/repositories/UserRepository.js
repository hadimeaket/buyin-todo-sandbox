"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const db_1 = require("../database/db");
class UserRepository {
    findByEmail(email) {
        const stmt = db_1.db.prepare("SELECT * FROM users WHERE email = ?");
        const row = stmt.get(email);
        return row ? this.rowToUser(row) : null;
    }
    findById(id) {
        const stmt = db_1.db.prepare("SELECT * FROM users WHERE id = ?");
        const row = stmt.get(id);
        return row ? this.rowToUser(row) : null;
    }
    create(user) {
        const stmt = db_1.db.prepare(`
      INSERT INTO users (id, email, passwordHash, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(user.id, user.email, user.passwordHash, user.createdAt.toISOString(), user.updatedAt.toISOString());
        return user;
    }
    clear() {
        db_1.db.prepare("DELETE FROM users").run();
    }
    rowToUser(row) {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map