"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPaymentRepository = void 0;
const Payment_1 = require("../../domain/entities/Payment");
const Payment_2 = require("../database/mongoose/models/Payment");
class MongoPaymentRepository {
    toDomain(doc) {
        return new Payment_1.Payment(doc._id.toString(), doc.orderId.toString(), doc.amount, doc.date, doc.note, doc.idempotencyKey, doc.createdAt);
    }
    toPersistence(payment) {
        return {
            orderId: payment.orderId,
            amount: payment.amount,
            date: payment.date,
            note: payment.note,
            idempotencyKey: payment.idempotencyKey
        };
    }
    async save(payment) {
        if (payment.id) {
            const updated = await Payment_2.Payment.findByIdAndUpdate(payment.id, this.toPersistence(payment), { new: true });
            if (!updated)
                throw new Error('Payment not found');
            return this.toDomain(updated);
        }
        else {
            const created = await Payment_2.Payment.create(this.toPersistence(payment));
            return this.toDomain(created);
        }
    }
    async findByOrderId(orderId) {
        const payments = await Payment_2.Payment.find({ orderId }).sort({ date: -1 });
        return payments.map(p => this.toDomain(p));
    }
    async findByIdempotencyKey(key) {
        const payment = await Payment_2.Payment.findOne({ idempotencyKey: key });
        if (!payment)
            return null;
        return this.toDomain(payment);
    }
}
exports.MongoPaymentRepository = MongoPaymentRepository;
//# sourceMappingURL=MongoPaymentRepository.js.map