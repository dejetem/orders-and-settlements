import { ITokenService } from './ITokenService';
export declare class JwtTokenService implements ITokenService {
    generateToken(userId: string): string;
    verifyToken(token: string): {
        userId: string;
    } | null;
}
//# sourceMappingURL=JwtTokenService.d.ts.map