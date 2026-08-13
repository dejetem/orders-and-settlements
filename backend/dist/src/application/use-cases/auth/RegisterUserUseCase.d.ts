import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordService } from '../../../infrastructure/services/IPasswordService';
import { ITokenService } from '../../../infrastructure/services/ITokenService';
export interface RegisterUserRequest {
    email: string;
    passwordRaw: string;
}
export declare class RegisterUserUseCase {
    private userRepository;
    private passwordService;
    private tokenService;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService, tokenService: ITokenService);
    execute(req: RegisterUserRequest): Promise<{
        user: User;
        token: string;
    }>;
}
//# sourceMappingURL=RegisterUserUseCase.d.ts.map