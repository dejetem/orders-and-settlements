import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordService } from '../../../infrastructure/services/IPasswordService';
import { ITokenService } from '../../../infrastructure/services/ITokenService';

export interface RegisterUserRequest {
  email: string;
  passwordRaw: string;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private tokenService: ITokenService
  ) {}

  public async execute(req: RegisterUserRequest): Promise<{ user: User, token: string }> {
    const existingUser = await this.userRepository.findByEmail(req.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.passwordService.hash(req.passwordRaw);

    const user = User.create(req.email, passwordHash);
    const savedUser = await this.userRepository.save(user);

    const token = this.tokenService.generateToken(savedUser.id as string);

    return { user: savedUser, token };
  }
}
