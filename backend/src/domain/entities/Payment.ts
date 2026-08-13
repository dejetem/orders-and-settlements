export class Payment {
  constructor(
    public readonly id: string | null,
    public orderId: string,
    public amount: number, // in cents
    public date: Date,
    public note?: string,
    public idempotencyKey?: string,
    public createdAt?: Date
  ) {}

  public static create(orderId: string, amount: number, note?: string, idempotencyKey?: string): Payment {
    return new Payment(
      null,
      orderId,
      amount,
      new Date(),
      note,
      idempotencyKey
    );
  }
}
