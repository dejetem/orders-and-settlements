import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
export declare class MongoAuditLogRepository implements IAuditLogRepository {
    private toDomain;
    private toPersistence;
    save(auditLog: AuditLog): Promise<AuditLog>;
    findByEntityId(entityId: string, userId?: string, page?: number, limit?: number): Promise<{
        items: AuditLog[];
        total: number;
    }>;
    logAction(entityId: string, userId: string, action: string, metadata?: any): Promise<void>;
}
//# sourceMappingURL=MongoAuditLogRepository.d.ts.map