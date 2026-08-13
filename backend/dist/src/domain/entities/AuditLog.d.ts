export declare class AuditLog {
    readonly id: string | null;
    entity: string;
    entityId: string;
    action: string;
    performedBy: string;
    userId: string;
    metadata?: Record<string, any> | undefined;
    timestamp?: Date | undefined;
    constructor(id: string | null, entity: string, entityId: string, action: string, performedBy: string, userId: string, metadata?: Record<string, any> | undefined, timestamp?: Date | undefined);
    static create(entity: string, entityId: string, action: string, performedBy: string, userId: string, metadata?: Record<string, any>): AuditLog;
}
//# sourceMappingURL=AuditLog.d.ts.map