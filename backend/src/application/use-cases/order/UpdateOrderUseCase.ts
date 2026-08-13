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

export class UpdateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  public async execute(req: UpdateOrderRequest): Promise<Order> {
    const order = await this.orderRepository.findById(req.orderId, req.userId);
    if (!order) {
      throw new Error('Order not found');
    }

    const previousTotal = order.total;

    order.updateDetails(req.customer, req.dueDate, req.lineItems);

    const updatedOrder = await this.orderRepository.update(order);

    await this.auditLogRepository.logAction(
      updatedOrder.id as string,
      req.userId,
      'order_edited',
      {
        previousTotal,
        newTotal: updatedOrder.total,
        customer: updatedOrder.customer,
      }
    );

    return updatedOrder;
  }
}
