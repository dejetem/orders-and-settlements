import { Order, OrderStatus } from '../entities/Order';
export interface OrderQueryFilters {
    userId: string;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export interface IOrderRepository {
    save(order: Order): Promise<Order>;
    update(order: Order): Promise<Order>;
    delete(id: string, userId: string): Promise<void>;
    findById(id: string, userId: string): Promise<Order | null>;
    find(filters: OrderQueryFilters): Promise<{
        items: Order[];
        total: number;
    }>;
}
//# sourceMappingURL=IOrderRepository.d.ts.map