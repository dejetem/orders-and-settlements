"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const JwtTokenService_1 = require("../../../infrastructure/services/JwtTokenService");
const tokenService = new JwtTokenService_1.JwtTokenService();
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const authenticate = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }
    try {
        const decoded = tokenService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }
        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - User not found' });
        }
        req.userId = user.id;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map