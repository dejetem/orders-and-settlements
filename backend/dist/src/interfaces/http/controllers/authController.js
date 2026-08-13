"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const http_status_codes_1 = require("http-status-codes");
const RegisterUserUseCase_1 = require("../../../application/use-cases/auth/RegisterUserUseCase");
const LoginUserUseCase_1 = require("../../../application/use-cases/auth/LoginUserUseCase");
const MongoUserRepository_1 = require("../../../infrastructure/repositories/MongoUserRepository");
const BcryptPasswordService_1 = require("../../../infrastructure/services/BcryptPasswordService");
const JwtTokenService_1 = require("../../../infrastructure/services/JwtTokenService");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
// Dependency Injection Setup (Simple Manual DI)
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const passwordService = new BcryptPasswordService_1.BcryptPasswordService();
const tokenService = new JwtTokenService_1.JwtTokenService();
const registerUserUseCase = new RegisterUserUseCase_1.RegisterUserUseCase(userRepository, passwordService, tokenService);
const loginUserUseCase = new LoginUserUseCase_1.LoginUserUseCase(userRepository, passwordService, tokenService);
const register = async (req, res) => {
    try {
        const { email, password } = registerSchema.parse(req.body);
        const { user, token } = await registerUserUseCase.execute({ email, passwordRaw: password });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, data: { id: user.id, email: user.email } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: error.errors });
        }
        if (error.message === 'User already exists') {
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json({ success: false, message: 'User already exists' });
        }
        console.error('Register Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const { user, token } = await loginUserUseCase.execute({ email, passwordRaw: password });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: { id: user.id, email: user.email } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: error.errors });
        }
        if (error.message === 'Invalid credentials') {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });
        }
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map