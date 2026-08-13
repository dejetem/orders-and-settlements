"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderUseCase = void 0;
class UpdateOrderUseCase {
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
        const previousTotal = order.total;
        order.updateDetails(req.customer, req.dueDate, req.lineItems);
        const updatedOrder = await this.orderRepository.update(order);
        await this.auditLogRepository.logAction(updatedOrder.id, req.userId, 'order_edited', {
            previousTotal,
            newTotal: updatedOrder.total,
            customer: updatedOrder.customer,
        });
        return updatedOrder;
    }
}
exports.UpdateOrderUseCase = UpdateOrderUseCase;
//# sourceMappingURL=UpdateOrderUseCase.js.map