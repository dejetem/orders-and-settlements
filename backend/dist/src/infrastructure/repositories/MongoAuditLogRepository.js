"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAuditLogRepository = void 0;
const AuditLog_1 = require("../../domain/entities/AuditLog");
const AuditLog_2 = require("../database/mongoose/models/AuditLog");
class MongoAuditLogRepository {
    toDomain(doc) {
        return new AuditLog_1.AuditLog(doc._id.toString(), doc.entity, doc.entityId.toString(), doc.action, doc.performedBy, doc.userId?.toString(), doc.metadata, doc.createdAt || new Date());
    }
    toPersistence(auditLog) {
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
    async save(auditLog) {
        if (auditLog.id) {
            const updated = await AuditLog_2.AuditLog.findByIdAndUpdate(auditLog.id, this.toPersistence(auditLog), { new: true });
            if (!updated)
                throw new Error('AuditLog not found');
            return this.toDomain(updated);
        }
        else {
            const created = await AuditLog_2.AuditLog.create(this.toPersistence(auditLog));
            return this.toDomain(created);
        }
    }
    async findByEntityId(entityId, userId, page, limit) {
        const query = { entityId };
        if (userId) {
            query.userId = userId;
        }
        const dbQuery = AuditLog_2.AuditLog.find(query).sort({ timestamp: -1 });
        if (page && limit) {
            dbQuery.skip((page - 1) * limit).limit(limit);
        }
        const [logs, total] = await Promise.all([
            dbQuery.exec(),
            AuditLog_2.AuditLog.countDocuments(query)
        ]);
        return {
            items: logs.map(log => this.toDomain(log)),
            total
        };
    }
    async logAction(entityId, userId, action, metadata) {
        const auditLog = AuditLog_1.AuditLog.create('Order', entityId, action, userId, userId, metadata);
        await this.save(auditLog);
    }
}
exports.MongoAuditLogRepository = MongoAuditLogRepository;
//# sourceMappingURL=MongoAuditLogRepository.js.map