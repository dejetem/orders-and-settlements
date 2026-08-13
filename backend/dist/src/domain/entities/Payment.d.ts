export declare class Payment {
    readonly id: string | null;
    orderId: string;
    amount: number;
    date: Date;
    note?: string | undefined;
    idempotencyKey?: string | undefined;
    createdAt?: Date | undefined;
    constructor(id: string | null, orderId: string, amount: number, // in cents
    date: Date, note?: string | undefined, idempotencyKey?: string | undefined, createdAt?: Date | undefined);
    static create(orderId: string, amount: number, note?: string, idempotencyKey?: string): Payment;
}
//# sourceMappingURL=Payment.d.ts.map