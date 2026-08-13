"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderUseCase = void 0;
const Order_1 = require("../../../domain/entities/Order");
const AuditLog_1 = require("../../../domain/entities/AuditLog");
class CreateOrderUseCase {
    orderRepository;
    auditLogRepository;
    constructor(orderRepository, auditLogRepository) {
        this.orderRepository = orderRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async execute(req) {
        const order = Order_1.Order.create(req.userId, req.customer, req.dueDate, req.lineItems);
        const savedOrder = await this.orderRepository.save(order);
        const auditLog = AuditLog_1.AuditLog.create('Order', savedOrder.id, 'ORDER_CREATED', req.userId, req.userId, { total: savedOrder.total, customer: savedOrder.customer });
        await this.auditLogRepository.save(auditLog);
        return savedOrder;
    }
}
exports.CreateOrderUseCase = CreateOrderUseCase;
//# sourceMappingURL=CreateOrderUseCase.js.map