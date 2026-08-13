import mongoose from 'mongoose';
import { Order as OrderModel } from './src/infrastructure/database/mongoose/models/Order';
import { MongoOrderRepository } from './src/infrastructure/repositories/MongoOrderRepository';
import { Order } from './src/domain/entities/Order';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/orders_db_test');
  const repo = new MongoOrderRepository();
  const o = Order.create("user1", "test", new Date(), []);
  const saved = await repo.save(o);
  console.log(JSON.stringify(saved, null, 2));
  process.exit(0);
}
run();
