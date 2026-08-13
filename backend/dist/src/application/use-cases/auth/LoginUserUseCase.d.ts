import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordService } from '../../../infrastructure/services/IPasswordService';
import { ITokenService } from '../../../infrastructure/services/ITokenService';
export interface LoginUserRequest {
    email: string;
    passwordRaw: string;
}
export declare class LoginUserUseCase {
    private userRepository;
    private passwordService;
    private tokenService;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService, tokenService: ITokenService);
    execute(req: LoginUserRequest): Promise<{
        user: User;
        token: string;
    }>;
}
//# sourceMappingURL=LoginUserUseCase.d.ts.map