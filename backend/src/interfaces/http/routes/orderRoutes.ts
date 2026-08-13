import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, addPayment, exportOrdersAsCsv, getOrderAuditLogs } from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all order routes
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/export', exportOrdersAsCsv);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.get('/:id/audit-logs', getOrderAuditLogs);
router.post('/:id/payments', addPayment);

export default router;
