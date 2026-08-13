import { Request, Response, NextFunction } from 'express';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { JwtTokenService } from '../../../infrastructure/services/JwtTokenService';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  userId?: string;
}

const tokenService = new JwtTokenService();
const userRepository = new MongoUserRepository();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    
    req.userId = user.id as string;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
  }
};
