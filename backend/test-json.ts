import { Order } from './src/domain/entities/Order';
const o = Order.create("user1", "cust1", new Date(), []);
console.log(JSON.stringify(o, null, 2));
