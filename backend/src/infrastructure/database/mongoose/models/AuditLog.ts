import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  entity: string;
  entityId: mongoose.Types.ObjectId;
  action: string;
  performedBy: string; // userId or 'system'
  userId: mongoose.Types.ObjectId;
  metadata: Record<string, any>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    entity: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} }, // Flexible JSON for arbitrary data
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
