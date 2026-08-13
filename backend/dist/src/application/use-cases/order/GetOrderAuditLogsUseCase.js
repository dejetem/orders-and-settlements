"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrderAuditLogsUseCase = void 0;
class GetOrderAuditLogsUseCase {
    auditLogRepository;
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async execute(req) {
        const result = await this.auditLogRepository.findByEntityId(req.orderId, req.userId, req.page, req.limit);
        const page = req.page || 1;
        const limit = req.limit || (result.total > 0 ? result.total : 1);
        return {
            items: result.items,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
        };
    }
}
exports.GetOrderAuditLogsUseCase = GetOrderAuditLogsUseCase;
//# sourceMappingURL=GetOrderAuditLogsUseCase.js.map