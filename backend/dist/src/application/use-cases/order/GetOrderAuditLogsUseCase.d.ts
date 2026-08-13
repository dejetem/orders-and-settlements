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
export declare class GetOrderAuditLogsUseCase {
    private auditLogRepository;
    constructor(auditLogRepository: IAuditLogRepository);
    execute(req: GetOrderAuditLogsRequest): Promise<PaginatedAuditLogsResponse>;
}
//# sourceMappingURL=GetOrderAuditLogsUseCase.d.ts.map