import { Order } from '../../../domain/entities/Order';
import { Payment } from '../../../domain/entities/Payment';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository';
export interface GetOrderByIdRequest {
    orderId: string;
    userId: string;
}
export declare class GetOrderByIdUseCase {
    private orderRepository;
    private paymentRepository;
    constructor(orderRepository: IOrderRepository, paymentRepository: IPaymentRepository);
    execute(req: GetOrderByIdRequest): Promise<{
        order: Order;
        payments: Payment[];
    }>;
}
//# sourceMappingURL=GetOrderByIdUseCase.d.ts.map