import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import { Payment } from '../../domain/entities/Payment';
import { Payment as PaymentModel, IPayment } from '../database/mongoose/models/Payment';

export class MongoPaymentRepository implements IPaymentRepository {
  private toDomain(doc: IPayment): Payment {
    return new Payment(
      doc._id.toString(),
      doc.orderId.toString(),
      doc.amount,
      doc.date,
      doc.note,
      doc.idempotencyKey,
      (doc as any).createdAt
    );
  }

  private toPersistence(payment: Payment): any {
    return {
      orderId: payment.orderId,
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
      idempotencyKey: payment.idempotencyKey
    };
  }

  async save(payment: Payment): Promise<Payment> {
    if (payment.id) {
      const updated = await PaymentModel.findByIdAndUpdate(payment.id, this.toPersistence(payment), { new: true });
      if (!updated) throw new Error('Payment not found');
      return this.toDomain(updated);
    } else {
      const created = await PaymentModel.create(this.toPersistence(payment));
      return this.toDomain(created);
    }
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    const payments = await PaymentModel.find({ orderId }).sort({ date: -1 });
    return payments.map(p => this.toDomain(p));
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ idempotencyKey: key });
    if (!payment) return null;
    return this.toDomain(payment);
  }
}
