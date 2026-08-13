"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MongoOrderRepository_1 = require("./src/infrastructure/repositories/MongoOrderRepository");
const Order_1 = require("./src/domain/entities/Order");
async function run() {
    await mongoose_1.default.connect('mongodb://localhost:27017/orders_db_test');
    const repo = new MongoOrderRepository_1.MongoOrderRepository();
    const o = Order_1.Order.create("user1", "test", new Date(), []);
    const saved = await repo.save(o);
    console.log(JSON.stringify(saved, null, 2));
    process.exit(0);
}
run();
//# sourceMappingURL=test-save.js.map