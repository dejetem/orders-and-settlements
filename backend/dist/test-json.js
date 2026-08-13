"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("./src/domain/entities/Order");
const o = Order_1.Order.create("user1", "cust1", new Date(), []);
console.log(JSON.stringify(o, null, 2));
//# sourceMappingURL=test-json.js.map