import { Request, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { CreateOrderUseCase } from '../../../application/use-cases/order/CreateOrderUseCase';
import { GetOrdersUseCase } from '../../../application/use-cases/order/GetOrdersUseCase';
import { GetOrderByIdUseCase } from '../../../application/use-cases/order/GetOrderByIdUseCase';
import { UpdateOrderUseCase } from '../../../application/use-cases/order/UpdateOrderUseCase';
import { DeleteOrderUseCase } from '../../../application/use-cases/order/DeleteOrderUseCase';
import { AddPaymentUseCase } from '../../../application/use-cases/payment/AddPaymentUseCase';
import { MongoOrderRepository } from '../../../infrastructure/repositories/MongoOrderRepository';
import { MongoPaymentRepository } from '../../../infrastructure/repositories/MongoPaymentRepository';
import { MongoAuditLogRepository } from '../../../infrastructure/repositories/MongoAuditLogRepository';
import { GetOrderAuditLogsUseCase } from '../../../application/use-cases/order/GetOrderAuditLogsUseCase';

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

const createOrderSchema = z.object({
  customer: z.string().min(1),
  dueDate: z.string().datetime(),
  lineItems: z.array(lineItemSchema).min(1),
});

const updateOrderSchema = createOrderSchema; // Reuse for now since it requires the same fields


const createPaymentSchema = z.object({
  amount: z.number().int().min(1),
  note: z.string().optional(),
});

// Manual DI Setup
const orderRepository = new MongoOrderRepository();
const paymentRepository = new MongoPaymentRepository();
const auditLogRepository = new MongoAuditLogRepository();

const createOrderUseCase = new CreateOrderUseCase(orderRepository, auditLogRepository);
const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository, paymentRepository);
const updateOrderUseCase = new UpdateOrderUseCase(orderRepository, auditLogRepository);
const deleteOrderUseCase = new DeleteOrderUseCase(orderRepository, auditLogRepository);
const addPaymentUseCase = new AddPaymentUseCase(orderRepository, paymentRepository, auditLogRepository);
const getOrderAuditLogsUseCase = new GetOrderAuditLogsUseCase(auditLogRepository);

export const createOrder = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { customer, dueDate, lineItems } = createOrderSchema.parse(req.body);

    const order = await createOrderUseCase.execute({
      userId: authReq.userId,
      customer,
      dueDate: new Date(dueDate),
      lineItems
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: order });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: (error as any).errors });
    }
    console.error('Create Order Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { status, page, limit, startDate, endDate } = req.query;

    const orders = await getOrdersUseCase.execute({
      userId: authReq.userId,
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.status(StatusCodes.OK).json({ success: true, data: orders });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const exportOrdersAsCsv = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { startDate, endDate } = req.query;

    const orders = await getOrdersUseCase.execute({
      userId: authReq.userId,
      startDate: startDate as string,
      endDate: endDate as string
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
    res.status(StatusCodes.OK).send(csvData);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const result = await getOrderByIdUseCase.execute({
      userId: authReq.userId,
      orderId: req.params.id as string
    });

    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { customer, dueDate, lineItems } = updateOrderSchema.parse(req.body);

    const order = await updateOrderUseCase.execute({
      orderId: req.params.id as string,
      userId: authReq.userId,
      customer,
      dueDate: new Date(dueDate),
      lineItems
    });

    res.status(StatusCodes.OK).json({ success: true, data: order });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: (error as any).errors });
    }
    if (error.message === 'Order not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }
    if (error.message === 'Cannot reduce order total below the already paid amount.') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
    console.error('Update Order Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;

    await deleteOrderUseCase.execute({
      orderId: req.params.id as string,
      userId: authReq.userId
    });

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }
    if (error.message === 'Cannot delete an order that has payments attached.') {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }
    console.error('Delete Order Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const addPayment = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { amount, note } = createPaymentSchema.parse(req.body);
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    const result = await addPaymentUseCase.execute({
      userId: authReq.userId,
      orderId: req.params.id as string,
      amount,
      note,
      idempotencyKey
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid data', errors: (error as any).errors });
    }
    
    if (error.name === 'VersionError') {
      return res.status(StatusCodes.CONFLICT).json({ 
        success: false, 
        message: 'Concurrency error: The order was updated by another request. Please try your payment again.' 
      });
    }

    if (error.message === 'Order not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }

    if (error.message.includes('Overpayment rejected')) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    }

    if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Payment was already processed successfully (idempotent request).'
      });
    }

    console.error('Add Payment Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};

export const getOrderAuditLogs = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const { page, limit } = req.query;
    const result = await getOrderAuditLogsUseCase.execute({
      userId: authReq.userId,
      orderId: req.params.id as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });

    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
  }
};
