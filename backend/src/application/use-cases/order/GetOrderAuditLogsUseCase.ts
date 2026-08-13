import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export interface GetOrderAuditLogsRequest {
  orderId: string;
  userId: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetOrderAuditLogsUseCase {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  public async execute(req: GetOrderAuditLogsRequest): Promise<PaginatedAuditLogsResponse> {
    const result = await this.auditLogRepository.findByEntityId(req.orderId, req.userId, req.page, req.limit);
    
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
