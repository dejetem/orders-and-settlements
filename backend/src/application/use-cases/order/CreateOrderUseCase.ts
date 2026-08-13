import { Order, ILineItem } from '../../../domain/entities/Order';
import { AuditLog } from '../../../domain/entities/AuditLog';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';

export interface CreateOrderRequest {
  userId: string;
  customer: string;
  dueDate: Date;
  lineItems: ILineItem[];
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  public async execute(req: CreateOrderRequest): Promise<Order> {
    const order = Order.create(
      req.userId,
      req.customer,
      req.dueDate,
      req.lineItems
    );

    const savedOrder = await this.orderRepository.save(order);

    const auditLog = AuditLog.create(
      'Order',
      savedOrder.id as string,
      'ORDER_CREATED',
      req.userId,
      req.userId,
      { total: savedOrder.total, customer: savedOrder.customer }
    );
    await this.auditLogRepository.save(auditLog);

    return savedOrder;
  }
}
