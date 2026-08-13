"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    email;
    passwordHash;
    createdAt;
    constructor(id, email, passwordHash, createdAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }
    static create(email, passwordHash) {
        return new User(null, email.toLowerCase().trim(), passwordHash);
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map