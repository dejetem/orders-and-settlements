"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
class AuditLog {
    id;
    entity;
    entityId;
    action;
    performedBy;
    userId;
    metadata;
    timestamp;
    constructor(id, entity, entityId, action, performedBy, userId, metadata, timestamp) {
        this.id = id;
        this.entity = entity;
        this.entityId = entityId;
        this.action = action;
        this.performedBy = performedBy;
        this.userId = userId;
        this.metadata = metadata;
        this.timestamp = timestamp;
    }
    static create(entity, entityId, action, performedBy, userId, metadata) {
        return new AuditLog(null, entity, entityId, action, performedBy, userId, metadata, new Date());
    }
}
exports.AuditLog = AuditLog;
//# sourceMappingURL=AuditLog.js.map