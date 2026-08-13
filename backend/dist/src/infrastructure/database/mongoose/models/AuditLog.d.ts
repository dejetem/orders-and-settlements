import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    entity: string;
    entityId: mongoose.Types.ObjectId;
    action: string;
    performedBy: string;
    userId: mongoose.Types.ObjectId;
    metadata: Record<string, any>;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
//# sourceMappingURL=AuditLog.d.ts.map