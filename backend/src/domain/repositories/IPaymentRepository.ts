import { Payment } from '../entities/Payment';

export interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  findByIdempotencyKey(key: string): Promise<Payment | null>;
}
