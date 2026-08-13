import { describe, it, expect } from '@jest/globals';
import { Order } from '../src/domain/entities/Order';

describe('Order Status Logic (Domain Entity)', () => {
  it('should be pending if no payments are made and not overdue', () => {
    const dueDate = new Date(Date.now() + 100000); // future
    const order = Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
    expect(order.status).toBe('pending');
  });

  it('should be overdue if no payments are made and past due', () => {
    const dueDate = new Date(Date.now() - 100000); // past
    const order = Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
    expect(order.status).toBe('overdue');
  });

  it('should be partially_paid if some payments are made and not overdue', () => {
    const dueDate = new Date(Date.now() + 100000); // future
    const order = Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
    order.addPayment(500);
    expect(order.status).toBe('partially_paid');
  });

  it('should be overdue if partially paid and past due', () => {
    const dueDate = new Date(Date.now() - 100000); // past
    const order = Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
    order.addPayment(500);
    expect(order.status).toBe('overdue');
  });

  it('should be paid if total payments equal order total regardless of due date', () => {
    const dueDate = new Date(Date.now() - 100000); // past
    const order = Order.create('org1', 'Test', dueDate, [{ description: 'Test', quantity: 1, unitPrice: 1000 }]);
    order.addPayment(1000);
    expect(order.status).toBe('paid');
  });
});
