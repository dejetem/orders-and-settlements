"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPaymentUseCase = void 0;
const Payment_1 = require("../../../domain/entities/Payment");
class AddPaymentUseCase {
    orderRepository;
    paymentRepository;
    auditLogRepository;
    constructor(orderRepository, paymentRepository, auditLogRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async execute(req) {
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
        const payment = Payment_1.Payment.create(savedOrder.id, req.amount, req.note, req.idempotencyKey);
        const savedPayment = await this.paymentRepository.save(payment);
        // Audit log
        await this.auditLogRepository.logAction(order.id, req.userId, 'payment_added', {
            amountPaid: req.amount,
            previousStatus,
            newStatus: savedOrder.status,
            idempotencyKey: req.idempotencyKey
        });
        return { order: savedOrder, payment: savedPayment };
    }
}
exports.AddPaymentUseCase = AddPaymentUseCase;
//# sourceMappingURL=AddPaymentUseCase.js.map