import { Order } from '../../../domain/entities/Order';
import { Payment } from '../../../domain/entities/Payment';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository';

export interface GetOrderByIdRequest {
  orderId: string;
  userId: string;
}

export class GetOrderByIdUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentRepository: IPaymentRepository
  ) {}

  public async execute(req: GetOrderByIdRequest): Promise<{ order: Order, payments: Payment[] }> {
    const order = await this.orderRepository.findById(req.orderId, req.userId);
    if (!order) {
      throw new Error('Order not found');
    }

    const payments = await this.paymentRepository.findByOrderId(order.id as string);

    return { order, payments };
  }
}
