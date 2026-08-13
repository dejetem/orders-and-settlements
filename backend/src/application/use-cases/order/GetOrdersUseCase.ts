import { Order, OrderStatus } from '../../../domain/entities/Order';
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

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  public async execute(req: GetOrdersRequest): Promise<PaginatedOrdersResponse> {
    const filters: any = { userId: req.userId };
    
    if (req.status && ['pending', 'partially_paid', 'paid', 'overdue'].includes(req.status)) {
      filters.status = req.status as OrderStatus;
    }

    if (req.startDate) {
      filters.startDate = new Date(req.startDate);
    }
    if (req.endDate) {
      const end = new Date(req.endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end;
    }

    if (req.page) filters.page = req.page;
    if (req.limit) filters.limit = req.limit;

    const result = await this.orderRepository.find(filters);
    
    const page = req.page || 1;
    const limit = req.limit || (result.total > 0 ? result.total : 1);
    
    return {
      items: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    };
  }
}
