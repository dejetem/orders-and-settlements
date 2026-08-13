import mongoose, { Document } from 'mongoose';
export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';
export interface ILineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    customer: string;
    dueDate: Date;
    status: OrderStatus;
    lineItems: ILineItem[];
    subtotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    updateStatus(): void;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
//# sourceMappingURL=Order.d.ts.map