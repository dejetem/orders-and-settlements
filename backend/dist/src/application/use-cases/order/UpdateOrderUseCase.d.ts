import { Order, ILineItem } from '../../../domain/entities/Order';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
export interface UpdateOrderRequest {
    orderId: string;
    userId: string;
    customer: string;
    dueDate: Date;
    lineItems: ILineItem[];
}
export declare class UpdateOrderUseCase {
    private orderRepository;
    private auditLogRepository;
    constructor(orderRepository: IOrderRepository, auditLogRepository: IAuditLogRepository);
    execute(req: UpdateOrderRequest): Promise<Order>;
}
//# sourceMappingURL=UpdateOrderUseCase.d.ts.map