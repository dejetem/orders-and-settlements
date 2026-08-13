import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';

export interface DeleteOrderRequest {
  orderId: string;
  userId: string;
}

export class DeleteOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  public async execute(req: DeleteOrderRequest): Promise<void> {
    const order = await this.orderRepository.findById(req.orderId, req.userId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.amountPaid > 0) {
      throw new Error('Cannot delete an order that has payments attached.');
    }

    await this.orderRepository.delete(req.orderId, req.userId);

    await this.auditLogRepository.logAction(
      req.orderId,
      req.userId,
      'order_deleted',
      {
        total: order.total,
        customer: order.customer,
      }
    );
  }
}
