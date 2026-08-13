import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { User as UserModel, IUser } from '../database/mongoose/models/User';

export class MongoUserRepository implements IUserRepository {
  private toDomain(doc: IUser): User {
    return new User(
      doc._id.toString(),
      doc.email,
      doc.passwordHash,
      (doc as any).createdAt
    );
  }

  private toPersistence(user: User): any {
    return {
      email: user.email,
      passwordHash: user.passwordHash
    };
  }

  async save(user: User): Promise<User> {
    if (user.id) {
      const updated = await UserModel.findByIdAndUpdate(user.id, this.toPersistence(user), { new: true });
      if (!updated) throw new Error('User not found');
      return this.toDomain(updated);
    } else {
      const created = await UserModel.create(this.toPersistence(user));
      return this.toDomain(created);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return this.toDomain(user);
  }
}
