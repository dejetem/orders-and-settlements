import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordService } from '../../../infrastructure/services/IPasswordService';
import { ITokenService } from '../../../infrastructure/services/ITokenService';

export interface LoginUserRequest {
  email: string;
  passwordRaw: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private tokenService: ITokenService
  ) {}

  public async execute(req: LoginUserRequest): Promise<{ user: User, token: string }> {
    const user = await this.userRepository.findByEmail(req.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await this.passwordService.compare(req.passwordRaw, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.tokenService.generateToken(user.id as string);

    return { user, token };
  }
}
