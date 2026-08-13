"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrderUseCase = void 0;
class DeleteOrderUseCase {
    orderRepository;
    auditLogRepository;
    constructor(orderRepository, auditLogRepository) {
        this.orderRepository = orderRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async execute(req) {
        const order = await this.orderRepository.findById(req.orderId, req.userId);
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.amountPaid > 0) {
            throw new Error('Cannot delete an order that has payments attached.');
        }
        await this.orderRepository.delete(req.orderId, req.userId);
        await this.auditLogRepository.logAction(req.orderId, req.userId, 'order_deleted', {
            total: order.total,
            customer: order.customer,
        });
    }
}
exports.DeleteOrderUseCase = DeleteOrderUseCase;
//# sourceMappingURL=DeleteOrderUseCase.js.map