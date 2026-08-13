import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import { Payment } from '../../domain/entities/Payment';
export declare class MongoPaymentRepository implements IPaymentRepository {
    private toDomain;
    private toPersistence;
    save(payment: Payment): Promise<Payment>;
    findByOrderId(orderId: string): Promise<Payment[]>;
    findByIdempotencyKey(key: string): Promise<Payment | null>;
}
//# sourceMappingURL=MongoPaymentRepository.d.ts.map