"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lineItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
});
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'partially_paid', 'paid', 'overdue'],
        default: 'pending'
    },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, required: true, min: 0 },
}, {
    timestamps: true,
    optimisticConcurrency: true // Enables __v checking on save() to prevent overpayment race conditions
});
// Method to automatically update status based on amountPaid and dueDate
orderSchema.methods.updateStatus = function () {
    const isOverdue = this.dueDate < new Date();
    if (this.amountPaid >= this.total) {
        this.status = 'paid';
    }
    else if (this.amountPaid > 0 && this.amountPaid < this.total) {
        this.status = isOverdue ? 'overdue' : 'partially_paid';
    }
    else {
        this.status = isOverdue ? 'overdue' : 'pending';
    }
    // Recalculate amountDue
    this.amountDue = this.total - this.amountPaid;
};
// Pre-save hook to ensure totals and status are correct
orderSchema.pre('save', function () {
    if (this.isModified('lineItems')) {
        let sub = 0;
        for (const item of this.lineItems) {
            sub += item.quantity * item.unitPrice;
        }
        this.subtotal = sub;
        this.total = sub; // As per assignment, total == subtotal
    }
    this.updateStatus();
});
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map