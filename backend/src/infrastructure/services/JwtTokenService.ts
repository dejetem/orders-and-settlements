import jwt from 'jsonwebtoken';
import { ITokenService } from './ITokenService';
import { env } from '../../config/env';

export class JwtTokenService implements ITokenService {
  generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '1d' });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }
}
