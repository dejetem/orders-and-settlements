"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const User_1 = require("../../../domain/entities/User");
class RegisterUserUseCase {
    userRepository;
    passwordService;
    tokenService;
    constructor(userRepository, passwordService, tokenService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }
    async execute(req) {
        const existingUser = await this.userRepository.findByEmail(req.email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const passwordHash = await this.passwordService.hash(req.passwordRaw);
        const user = User_1.User.create(req.email, passwordHash);
        const savedUser = await this.userRepository.save(user);
        const token = this.tokenService.generateToken(savedUser.id);
        return { user: savedUser, token };
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
//# sourceMappingURL=RegisterUserUseCase.js.map