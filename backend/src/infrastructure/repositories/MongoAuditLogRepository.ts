import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
import { AuditLog as AuditLogModel, IAuditLog } from '../database/mongoose/models/AuditLog';

export class MongoAuditLogRepository implements IAuditLogRepository {
  private toDomain(doc: IAuditLog): AuditLog {
    return new AuditLog(
      doc._id.toString(),
      doc.entity,
      doc.entityId.toString(),
      doc.action,
      doc.performedBy,
      doc.userId?.toString(),
      doc.metadata,
      (doc as any).createdAt || new Date()
    );
  }

  private toPersistence(auditLog: AuditLog): any {
    return {
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      action: auditLog.action,
      performedBy: auditLog.performedBy,
      userId: auditLog.userId,
      metadata: auditLog.metadata,
      timestamp: auditLog.timestamp
    };
  }

  async save(auditLog: AuditLog): Promise<AuditLog> {
    if (auditLog.id) {
      const updated = await AuditLogModel.findByIdAndUpdate(auditLog.id, this.toPersistence(auditLog), { new: true });
      if (!updated) throw new Error('AuditLog not found');
      return this.toDomain(updated);
    } else {
      const created = await AuditLogModel.create(this.toPersistence(auditLog));
      return this.toDomain(created);
    }
  }

  async findByEntityId(entityId: string, userId?: string, page?: number, limit?: number): Promise<{ items: AuditLog[], total: number }> {
    const query: any = { entityId };
    if (userId) {
      query.userId = userId;
    }
    const dbQuery = AuditLogModel.find(query).sort({ timestamp: -1 });

    if (page && limit) {
      dbQuery.skip((page - 1) * limit).limit(limit);
    }

    const [logs, total] = await Promise.all([
      dbQuery.exec(),
      AuditLogModel.countDocuments(query)
    ]);

    return {
      items: logs.map(log => this.toDomain(log)),
      total
    };
  }

  async logAction(entityId: string, userId: string, action: string, metadata?: any): Promise<void> {
    const auditLog = AuditLog.create(
      'Order',
      entityId,
      action,
      userId,
      userId,
      metadata
    );
    await this.save(auditLog);
  }
}
