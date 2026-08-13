"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
class LoginUserUseCase {
    userRepository;
    passwordService;
    tokenService;
    constructor(userRepository, passwordService, tokenService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }
    async execute(req) {
        const user = await this.userRepository.findByEmail(req.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await this.passwordService.compare(req.passwordRaw, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = this.tokenService.generateToken(user.id);
        return { user, token };
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
//# sourceMappingURL=LoginUserUseCase.js.map