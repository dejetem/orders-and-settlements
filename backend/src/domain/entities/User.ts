export class User {
  constructor(
    public readonly id: string | null,
    public email: string,
    public passwordHash: string,
    public createdAt?: Date
  ) {}

  public static create(email: string, passwordHash: string): User {
    return new User(null, email.toLowerCase().trim(), passwordHash);
  }
}
