import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
export interface DeleteOrderRequest {
    orderId: string;
    userId: string;
}
export declare class DeleteOrderUseCase {
    private orderRepository;
    private auditLogRepository;
    constructor(orderRepository: IOrderRepository, auditLogRepository: IAuditLogRepository);
    execute(req: DeleteOrderRequest): Promise<void>;
}
//# sourceMappingURL=DeleteOrderUseCase.d.ts.map