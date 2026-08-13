"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrderByIdUseCase = void 0;
class GetOrderByIdUseCase {
    orderRepository;
    paymentRepository;
    constructor(orderRepository, paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(req) {
        const order = await this.orderRepository.findById(req.orderId, req.userId);
        if (!order) {
            throw new Error('Order not found');
        }
        const payments = await this.paymentRepository.findByOrderId(order.id);
        return { order, payments };
    }
}
exports.GetOrderByIdUseCase = GetOrderByIdUseCase;
//# sourceMappingURL=GetOrderByIdUseCase.js.map