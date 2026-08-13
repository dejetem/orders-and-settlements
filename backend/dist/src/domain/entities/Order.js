"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
class Order {
    id;
    userId;
    customer;
    dueDate;
    lineItems;
    subtotal;
    total;
    amountPaid;
    amountDue;
    status;
    createdAt;
    updatedAt;
    constructor(id, userId, customer, dueDate, lineItems, subtotal, total, amountPaid, amountDue, status, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.customer = customer;
        this.dueDate = dueDate;
        this.lineItems = lineItems;
        this.subtotal = subtotal;
        this.total = total;
        this.amountPaid = amountPaid;
        this.amountDue = amountDue;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(userId, customer, dueDate, lineItems) {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const order = new Order(null, userId, customer, dueDate, lineItems, subtotal, subtotal, // total = subtotal
        0, subtotal, // amountDue = total
        'pending');
        order.updateStatus();
        return order;
    }
    addPayment(amount) {
        if (this.amountPaid + amount > this.total) {
            throw new Error(`Overpayment rejected. Maximum allowed payment is ${(this.total - this.amountPaid) / 100} dollars.`);
        }
        this.amountPaid += amount;
        this.updateStatus();
    }
    updateDetails(customer, dueDate, lineItems) {
        const newSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const newTotal = newSubtotal; // Assuming no tax or discount for now
        if (newTotal < this.amountPaid) {
            throw new Error('Cannot reduce order total below the already paid amount.');
        }
        this.customer = customer;
        this.dueDate = dueDate;
        this.lineItems = lineItems;
        this.subtotal = newSubtotal;
        this.total = newTotal;
        this.updateStatus();
        this.updatedAt = new Date();
    }
    updateStatus() {
        const isOverdue = this.dueDate < new Date();
        if (this.amountPaid >= this.total) {
            this.status = 'paid';
        }
        else if (this.amountPaid > 0 && this.amountPaid < this.total) {
            this.status = isOverdue ? 'overdue' : 'partially_paid';
        }
        else {
            this.status = isOverdue ? 'overdue' : 'pending';
        }
        this.amountDue = this.total - this.amountPaid;
    }
}
exports.Order = Order;
//# sourceMappingURL=Order.js.map