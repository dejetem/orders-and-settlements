"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrdersUseCase = void 0;
class GetOrdersUseCase {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute(req) {
        const filters = { userId: req.userId };
        if (req.status && ['pending', 'partially_paid', 'paid', 'overdue'].includes(req.status)) {
            filters.status = req.status;
        }
        if (req.startDate) {
            filters.startDate = new Date(req.startDate);
        }
        if (req.endDate) {
            const end = new Date(req.endDate);
            end.setHours(23, 59, 59, 999);
            filters.endDate = end;
        }
        if (req.page)
            filters.page = req.page;
        if (req.limit)
            filters.limit = req.limit;
        const result = await this.orderRepository.find(filters);
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
exports.GetOrdersUseCase = GetOrdersUseCase;
//# sourceMappingURL=GetOrdersUseCase.js.map