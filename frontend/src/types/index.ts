export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface LineItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customer: string;
  dueDate: string;
  status: OrderStatus;
  lineItems: LineItem[];
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
}
