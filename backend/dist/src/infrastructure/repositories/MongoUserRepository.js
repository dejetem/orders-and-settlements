"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const User_1 = require("../../domain/entities/User");
const User_2 = require("../database/mongoose/models/User");
class MongoUserRepository {
    toDomain(doc) {
        return new User_1.User(doc._id.toString(), doc.email, doc.passwordHash, doc.createdAt);
    }
    toPersistence(user) {
        return {
            email: user.email,
            passwordHash: user.passwordHash
        };
    }
    async save(user) {
        if (user.id) {
            const updated = await User_2.User.findByIdAndUpdate(user.id, this.toPersistence(user), { new: true });
            if (!updated)
                throw new Error('User not found');
            return this.toDomain(updated);
        }
        else {
            const created = await User_2.User.create(this.toPersistence(user));
            return this.toDomain(created);
        }
    }
    async findByEmail(email) {
        const user = await User_2.User.findOne({ email });
        if (!user)
            return null;
        return this.toDomain(user);
    }
    async findById(id) {
        const user = await User_2.User.findById(id);
        if (!user)
            return null;
        return this.toDomain(user);
    }
}
exports.MongoUserRepository = MongoUserRepository;
//# sourceMappingURL=MongoUserRepository.js.map