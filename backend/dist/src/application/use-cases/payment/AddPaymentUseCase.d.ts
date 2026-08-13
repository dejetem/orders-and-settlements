import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
export interface AddPaymentRequest {
    orderId: string;
    userId: string;
    amount: number;
    note?: string;
    idempotencyKey?: string;
}
export declare class AddPaymentUseCase {
    private orderRepository;
    private paymentRepository;
    private auditLogRepository;
    constructor(orderRepository: IOrderRepository, paymentRepository: IPaymentRepository, auditLogRepository: IAuditLogRepository);
    execute(req: AddPaymentRequest): Promise<{
        order: any;
        payment: any;
    }>;
}
//# sourceMappingURL=AddPaymentUseCase.d.ts.map