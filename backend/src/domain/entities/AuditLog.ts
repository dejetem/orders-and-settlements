export class AuditLog {
  constructor(
    public readonly id: string | null,
    public entity: string,
    public entityId: string,
    public action: string,
    public performedBy: string,
    public userId: string,
    public metadata?: Record<string, any>,
    public timestamp?: Date
  ) {}

  public static create(
    entity: string,
    entityId: string,
    action: string,
    performedBy: string,
    userId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    return new AuditLog(
      null,
      entity,
      entityId,
      action,
      performedBy,
      userId,
      metadata,
      new Date()
    );
  }
}
