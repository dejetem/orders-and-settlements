"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    id;
    orderId;
    amount;
    date;
    note;
    idempotencyKey;
    createdAt;
    constructor(id, orderId, amount, // in cents
    date, note, idempotencyKey, createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.amount = amount;
        this.date = date;
        this.note = note;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
    }
    static create(orderId, amount, note, idempotencyKey) {
        return new Payment(null, orderId, amount, new Date(), note, idempotencyKey);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=Payment.js.map