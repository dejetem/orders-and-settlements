import { Order } from '../../../domain/entities/Order';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
export interface GetOrdersRequest {
    userId: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export interface PaginatedOrdersResponse {
    items: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class GetOrdersUseCase {
    private orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute(req: GetOrdersRequest): Promise<PaginatedOrdersResponse>;
}
//# sourceMappingURL=GetOrdersUseCase.d.ts.map