import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  save(auditLog: AuditLog): Promise<AuditLog>;
  findByEntityId(entityId: string, userId: string, page?: number, limit?: number): Promise<{ items: AuditLog[], total: number }>;
  logAction(entityId: string, userId: string, action: string, metadata?: any): Promise<void>;
}
