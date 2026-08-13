"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Order_1 = require("../src/domain/entities/Order");
(0, globals_1.describe)('Order Status Logic (Domain Entity)', () => {
    (0, globals_1.it)('should be pending if no payments are made and not overdue', () => {
        const dueDate = new Date(Date.now() + 100000); // future
        const order = Order_1.Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
        (0, globals_1.expect)(order.status).toBe('pending');
    });
    (0, globals_1.it)('should be overdue if no payments are made and past due', () => {
        const dueDate = new Date(Date.now() - 100000); // past
        const order = Order_1.Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
        (0, globals_1.expect)(order.status).toBe('overdue');
    });
    (0, globals_1.it)('should be partially_paid if some payments are made and not overdue', () => {
        const dueDate = new Date(Date.now() + 100000); // future
        const order = Order_1.Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
        order.addPayment(500);
        (0, globals_1.expect)(order.status).toBe('partially_paid');
    });
    (0, globals_1.it)('should be overdue if partially paid and past due', () => {
        const dueDate = new Date(Date.now() - 100000); // past
        const order = Order_1.Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
        order.addPayment(500);
        (0, globals_1.expect)(order.status).toBe('overdue');
    });
    (0, globals_1.it)('should be paid if total payments equal order total regardless of due date', () => {
        const dueDate = new Date(Date.now() - 100000); // past
        const order = Order_1.Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
        order.addPayment(1000);
        (0, globals_1.expect)(order.status).toBe('paid');
    });
});
//# sourceMappingURL=order.test.js.map