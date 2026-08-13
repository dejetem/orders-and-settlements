export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';
export interface ILineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class Order {
    readonly id: string | null;
    userId: string;
    customer: string;
    dueDate: Date;
    lineItems: ILineItem[];
    subtotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    status: OrderStatus;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: string | null, userId: string, customer: string, dueDate: Date, lineItems: ILineItem[], subtotal: number, total: number, amountPaid: number, amountDue: number, status: OrderStatus, createdAt?: Date | undefined, updatedAt?: Date | undefined);
    static create(userId: string, customer: string, dueDate: Date, lineItems: ILineItem[]): Order;
    addPayment(amount: number): void;
    updateDetails(customer: string, dueDate: Date, lineItems: ILineItem[]): void;
    updateStatus(): void;
}
//# sourceMappingURL=Order.d.ts.map