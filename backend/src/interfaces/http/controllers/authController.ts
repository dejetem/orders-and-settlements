import { Request, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { BcryptPasswordService } from '../../../infrastructure/services/BcryptPasswordService';
import { JwtTokenService } from '../../../infrastructure/services/JwtTokenService';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Dependency Injection Setup (Simple Manual DI)
const userRepository = new MongoUserRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordService,
  tokenService
);

const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordService,
  tokenService
);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const { user, token } = await registerUserUseCase.execute({ email, passwordRaw: password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: (error as any).errors });
    }
    if (error.message === 'User already exists') {
      return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'User already exists' });
    }
    console.error('Register Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { user, token } = await loginUserUseCase.execute({ email, passwordRaw: password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: (error as any).errors });
    }
    if (error.message === 'Invalid credentials') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(StatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    res.status(StatusCodes.OK).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};
