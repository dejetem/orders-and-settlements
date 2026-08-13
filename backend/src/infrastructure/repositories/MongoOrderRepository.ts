import { IOrderRepository, OrderQueryFilters } from '../../domain/repositories/IOrderRepository';
import { Order, OrderStatus, ILineItem } from '../../domain/entities/Order';
import { Order as OrderModel, IOrder } from '../database/mongoose/models/Order';

export class MongoOrderRepository implements IOrderRepository {
  private toDomain(doc: IOrder): Order {
    return new Order(
      doc._id.toString(),
      doc.userId.toString(),
      doc.customer,
      doc.dueDate,
      doc.lineItems.map(li => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice
      })),
      doc.subtotal,
      doc.total,
      doc.amountPaid,
      doc.amountDue,
      doc.status as OrderStatus,
      (doc as any).createdAt,
      (doc as any).updatedAt
    );
  }

  private toPersistence(order: Order): any {
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

  async save(order: Order): Promise<Order> {
    if (order.id) {
      const updated = await OrderModel.findByIdAndUpdate(
        order.id,
        this.toPersistence(order),
        { new: true, runValidators: true }
      );
      if (!updated) throw new Error('Order not found for update');
      return this.toDomain(updated);
    } else {
      const created = await OrderModel.create(this.toPersistence(order));
      return this.toDomain(created);
    }
  }

  async update(order: Order): Promise<Order> {
    const updated = await OrderModel.findByIdAndUpdate(order.id, this.toPersistence(order), { new: true });
    if (!updated) throw new Error('Order not found');
    return this.toDomain(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await OrderModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new Error('Order not found or unauthorized');
    }
  }

  async findById(id: string, userId: string): Promise<Order | null> {
    const order = await OrderModel.findOne({ _id: id, userId });
    if (!order) return null;
    return this.toDomain(order);
  }

  async find(filters: OrderQueryFilters, page?: number, limit?: number): Promise<{ items: Order[], total: number }> {
    const filterQuery: any = { userId: filters.userId };
    
    if (filters.status) filterQuery.status = filters.status;
    if (filters.startDate || filters.endDate) {
      filterQuery.createdAt = {};
      if (filters.startDate) filterQuery.createdAt.$gte = filters.startDate;
      if (filters.endDate) filterQuery.createdAt.$lte = filters.endDate;
    }

    const query = OrderModel.find(filterQuery).sort({ createdAt: -1 });

    if (filters.page && filters.limit) {
      query.skip((filters.page - 1) * filters.limit).limit(filters.limit);
    }

    const [orders, total] = await Promise.all([
      query.exec(),
      OrderModel.countDocuments(filterQuery)
    ]);

    return {
      items: orders.map(order => this.toDomain(order)),
      total
    };
  }
}
