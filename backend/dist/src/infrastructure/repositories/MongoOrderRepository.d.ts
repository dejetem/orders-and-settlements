import { IOrderRepository, OrderQueryFilters } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
export declare class MongoOrderRepository implements IOrderRepository {
    private toDomain;
    private toPersistence;
    save(order: Order): Promise<Order>;
    update(order: Order): Promise<Order>;
    delete(id: string, userId: string): Promise<void>;
    findById(id: string, userId: string): Promise<Order | null>;
    find(filters: OrderQueryFilters, page?: number, limit?: number): Promise<{
        items: Order[];
        total: number;
    }>;
}
//# sourceMappingURL=MongoOrderRepository.d.ts.map