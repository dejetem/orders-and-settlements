export declare class User {
    readonly id: string | null;
    email: string;
    passwordHash: string;
    createdAt?: Date | undefined;
    constructor(id: string | null, email: string, passwordHash: string, createdAt?: Date | undefined);
    static create(email: string, passwordHash: string): User;
}
//# sourceMappingURL=User.d.ts.map