"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all order routes
router.use(auth_1.authenticate);
router.post('/', orderController_1.createOrder);
router.get('/', orderController_1.getOrders);
router.get('/export', orderController_1.exportOrdersAsCsv);
router.get('/:id', orderController_1.getOrderById);
router.put('/:id', orderController_1.updateOrder);
router.delete('/:id', orderController_1.deleteOrder);
router.get('/:id/audit-logs', orderController_1.getOrderAuditLogs);
router.post('/:id/payments', orderController_1.addPayment);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map