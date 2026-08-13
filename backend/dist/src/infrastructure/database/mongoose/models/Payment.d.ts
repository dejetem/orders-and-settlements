import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    note?: string;
    idempotencyKey?: string;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment>;
//# sourceMappingURL=Payment.d.ts.map