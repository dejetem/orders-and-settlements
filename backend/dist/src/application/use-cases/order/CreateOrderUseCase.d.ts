import { Order, ILineItem } from '../../../domain/entities/Order';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
export interface CreateOrderRequest {
    userId: string;
    customer: string;
    dueDate: Date;
    lineItems: ILineItem[];
}
export declare class CreateOrderUseCase {
    private orderRepository;
    private auditLogRepository;
    constructor(orderRepository: IOrderRepository, auditLogRepository: IAuditLogRepository);
    execute(req: CreateOrderRequest): Promise<Order>;
}
//# sourceMappingURL=CreateOrderUseCase.d.ts.map