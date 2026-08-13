import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
export declare class MongoUserRepository implements IUserRepository {
    private toDomain;
    private toPersistence;
    save(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
//# sourceMappingURL=MongoUserRepository.d.ts.map