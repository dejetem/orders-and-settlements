"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoOrderRepository = void 0;
const Order_1 = require("../../domain/entities/Order");
const Order_2 = require("../database/mongoose/models/Order");
class MongoOrderRepository {
    toDomain(doc) {
        return new Order_1.Order(doc._id.toString(), doc.userId.toString(), doc.customer, doc.dueDate, doc.lineItems.map(li => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice
        })), doc.subtotal, doc.total, doc.amountPaid, doc.amountDue, doc.status, doc.createdAt, doc.updatedAt);
    }
    toPersistence(order) {
        return {
            userId: order.userId,
            customer: order.customer,
            dueDate: order.dueDate,
            lineItems: order.lineItems,
            subtotal: order.subtotal,
            total: order.total,
            amountPaid: order.amountPaid,
            amountDue: order.amountDue,
            status: order.status
        };
    }
    async save(order) {
        if (order.id) {
            const updated = await Order_2.Order.findByIdAndUpdate(order.id, this.toPersistence(order), { new: true, runValidators: true });
            if (!updated)
                throw new Error('Order not found for update');
            return this.toDomain(updated);
        }
        else {
            const created = await Order_2.Order.create(this.toPersistence(order));
            return this.toDomain(created);
        }
    }
    async update(order) {
        const updated = await Order_2.Order.findByIdAndUpdate(order.id, this.toPersistence(order), { new: true });
        if (!updated)
            throw new Error('Order not found');
        return this.toDomain(updated);
    }
    async delete(id, userId) {
        const result = await Order_2.Order.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            throw new Error('Order not found or unauthorized');
        }
    }
    async findById(id, userId) {
        const order = await Order_2.Order.findOne({ _id: id, userId });
        if (!order)
            return null;
        return this.toDomain(order);
    }
    async find(filters, page, limit) {
        const filterQuery = { userId: filters.userId };
        if (filters.status)
            filterQuery.status = filters.status;
        if (filters.startDate || filters.endDate) {
            filterQuery.createdAt = {};
            if (filters.startDate)
                filterQuery.createdAt.$gte = filters.startDate;
            if (filters.endDate)
                filterQuery.createdAt.$lte = filters.endDate;
        }
        const query = Order_2.Order.find(filterQuery).sort({ createdAt: -1 });
        if (filters.page && filters.limit) {
            query.skip((filters.page - 1) * filters.limit).limit(filters.limit);
        }
        const [orders, total] = await Promise.all([
            query.exec(),
            Order_2.Order.countDocuments(filterQuery)
        ]);
        return {
            items: orders.map(order => this.toDomain(order)),
            total
        };
    }
}
exports.MongoOrderRepository = MongoOrderRepository;
//# sourceMappingURL=MongoOrderRepository.js.map