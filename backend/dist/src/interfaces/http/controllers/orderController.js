"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAuditLogs = exports.addPayment = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.exportOrdersAsCsv = exports.getOrders = exports.createOrder = void 0;
const zod_1 = require("zod");
const http_status_codes_1 = require("http-status-codes");
const CreateOrderUseCase_1 = require("../../../application/use-cases/order/CreateOrderUseCase");
const GetOrdersUseCase_1 = require("../../../application/use-cases/order/GetOrdersUseCase");
const GetOrderByIdUseCase_1 = require("../../../application/use-cases/order/GetOrderByIdUseCase");
const UpdateOrderUseCase_1 = require("../../../application/use-cases/order/UpdateOrderUseCase");
const DeleteOrderUseCase_1 = require("../../../application/use-cases/order/DeleteOrderUseCase");
const AddPaymentUseCase_1 = require("../../../application/use-cases/payment/AddPaymentUseCase");
const MongoOrderRepository_1 = require("../../../infrastructure/repositories/MongoOrderRepository");
const MongoPaymentRepository_1 = require("../../../infrastructure/repositories/MongoPaymentRepository");
const MongoAuditLogRepository_1 = require("../../../infrastructure/repositories/MongoAuditLogRepository");
const GetOrderAuditLogsUseCase_1 = require("../../../application/use-cases/order/GetOrderAuditLogsUseCase");
const lineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().min(1),
    unitPrice: zod_1.z.number().min(0),
});
const createOrderSchema = zod_1.z.object({
    customer: zod_1.z.string().min(1),
    dueDate: zod_1.z.string().datetime(),
    lineItems: zod_1.z.array(lineItemSchema).min(1),
});
const updateOrderSchema = createOrderSchema; // Reuse for now since it requires the same fields
const createPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().int().min(1),
    note: zod_1.z.string().optional(),
});
// Manual DI Setup
const orderRepository = new MongoOrderRepository_1.MongoOrderRepository();
const paymentRepository = new MongoPaymentRepository_1.MongoPaymentRepository();
const auditLogRepository = new MongoAuditLogRepository_1.MongoAuditLogRepository();
const createOrderUseCase = new CreateOrderUseCase_1.CreateOrderUseCase(orderRepository, auditLogRepository);
const getOrdersUseCase = new GetOrdersUseCase_1.GetOrdersUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase_1.GetOrderByIdUseCase(orderRepository, paymentRepository);
const updateOrderUseCase = new UpdateOrderUseCase_1.UpdateOrderUseCase(orderRepository, auditLogRepository);
const deleteOrderUseCase = new DeleteOrderUseCase_1.DeleteOrderUseCase(orderRepository, auditLogRepository);
const addPaymentUseCase = new AddPaymentUseCase_1.AddPaymentUseCase(orderRepository, paymentRepository, auditLogRepository);
const getOrderAuditLogsUseCase = new GetOrderAuditLogsUseCase_1.GetOrderAuditLogsUseCase(auditLogRepository);
const createOrder = async (req, res) => {
    try {
        const authReq = req;
        const { customer, dueDate, lineItems } = createOrderSchema.parse(req.body);
        const order = await createOrderUseCase.execute({
            userId: authReq.userId,
            customer,
            dueDate: new Date(dueDate),
            lineItems
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, data: order });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: error.errors });
        }
        console.error('Create Order Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const authReq = req;
        const { status, page, limit, startDate, endDate } = req.query;
        const orders = await getOrdersUseCase.execute({
            userId: authReq.userId,
            status: status,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            startDate: startDate,
            endDate: endDate
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: orders });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.getOrders = getOrders;
const exportOrdersAsCsv = async (req, res) => {
    try {
        const authReq = req;
        const { startDate, endDate } = req.query;
        const orders = await getOrdersUseCase.execute({
            userId: authReq.userId,
            startDate: startDate,
            endDate: endDate
        });
        const header = ['ID,Customer,Due Date,Status,Subtotal,Total,Amount Paid,Amount Due,Created At'];
        const rows = orders.items.map(order => {
            return [
                order.id,
                `"${order.customer.replace(/"/g, '""')}"`,
                order.dueDate.toISOString(),
                order.status,
                (order.subtotal / 100).toFixed(2),
                (order.total / 100).toFixed(2),
                (order.amountPaid / 100).toFixed(2),
                (order.amountDue / 100).toFixed(2),
                order.createdAt?.toISOString()
            ].join(',');
        });
        const csvData = header.concat(rows).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        res.status(http_status_codes_1.StatusCodes.OK).send(csvData);
    }
    catch (error) {
        console.error('Export Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.exportOrdersAsCsv = exportOrdersAsCsv;
const getOrderById = async (req, res) => {
    try {
        const authReq = req;
        const result = await getOrderByIdUseCase.execute({
            userId: authReq.userId,
            orderId: req.params.id
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: result });
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.getOrderById = getOrderById;
const updateOrder = async (req, res) => {
    try {
        const authReq = req;
        const { customer, dueDate, lineItems } = updateOrderSchema.parse(req.body);
        const order = await updateOrderUseCase.execute({
            orderId: req.params.id,
            userId: authReq.userId,
            customer,
            dueDate: new Date(dueDate),
            lineItems
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: order });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: error.errors });
        }
        if (error.message === 'Order not found') {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }
        if (error.message === 'Cannot reduce order total below the already paid amount.') {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
        }
        console.error('Update Order Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    try {
        const authReq = req;
        await deleteOrderUseCase.execute({
            orderId: req.params.id,
            userId: authReq.userId
        });
        res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }
        if (error.message === 'Cannot delete an order that has payments attached.') {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
        }
        console.error('Delete Order Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.deleteOrder = deleteOrder;
const addPayment = async (req, res) => {
    try {
        const authReq = req;
        const { amount, note } = createPaymentSchema.parse(req.body);
        const idempotencyKey = req.headers['idempotency-key'];
        const result = await addPaymentUseCase.execute({
            userId: authReq.userId,
            orderId: req.params.id,
            amount,
            note,
            idempotencyKey
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, data: result });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: error.errors });
        }
        if (error.name === 'VersionError') {
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                success: false,
                message: 'Concurrency error: The order was updated by another request. Please try your payment again.'
            });
        }
        if (error.message === 'Order not found') {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }
        if (error.message.includes('Overpayment rejected')) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
        }
        if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: 'Payment was already processed successfully (idempotent request).'
            });
        }
        console.error('Add Payment Error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.addPayment = addPayment;
const getOrderAuditLogs = async (req, res) => {
    try {
        const authReq = req;
        const { page, limit } = req.query;
        const result = await getOrderAuditLogsUseCase.execute({
            userId: authReq.userId,
            orderId: req.params.id,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, data: result });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
exports.getOrderAuditLogs = getOrderAuditLogs;
//# sourceMappingURL=orderController.js.map