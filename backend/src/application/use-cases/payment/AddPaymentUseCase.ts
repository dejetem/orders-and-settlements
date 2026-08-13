import { Payment } from '../../../domain/entities/Payment';
import { AuditLog } from '../../../domain/entities/AuditLog';
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

export class AddPaymentUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentRepository: IPaymentRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  public async execute(req: AddPaymentRequest): Promise<{ order: any, payment: any }> {
    if (req.idempotencyKey) {
      const existingPayment = await this.paymentRepository.findByIdempotencyKey(req.idempotencyKey);
      if (existingPayment) {
        // Idempotent return (in a real scenario, we might want to return the order too)
        return { order: null, payment: existingPayment };
      }
    }

    const order = await this.orderRepository.findById(req.orderId, req.userId);
    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;

    // This will throw if amount > amountDue
    order.addPayment(req.amount);
    
    // Save order
    const savedOrder = await this.orderRepository.save(order);

    // Create payment
    const payment = Payment.create(
      savedOrder.id as string,
      req.amount,
      req.note,
      req.idempotencyKey
    );
    const savedPayment = await this.paymentRepository.save(payment);

    // Audit log
    await this.auditLogRepository.logAction(
      order.id as string,
      req.userId,
      'payment_added',
      { 
        amountPaid: req.amount, 
        previousStatus, 
        newStatus: savedOrder.status,
        idempotencyKey: req.idempotencyKey 
      }
    );

    return { order: savedOrder, payment: savedPayment };
  }
}
