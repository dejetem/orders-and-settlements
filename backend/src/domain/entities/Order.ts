export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number; // Stored in cents
}

export class Order {
  constructor(
    public readonly id: string | null,
    public userId: string,
    public customer: string,
    public dueDate: Date,
    public lineItems: ILineItem[],
    public subtotal: number,
    public total: number,
    public amountPaid: number,
    public amountDue: number,
    public status: OrderStatus,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  public static create(userId: string, customer: string, dueDate: Date, lineItems: ILineItem[]): Order {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const order = new Order(
      null,
      userId,
      customer,
      dueDate,
      lineItems,
      subtotal,
      subtotal, // total = subtotal
      0,
      subtotal, // amountDue = total
      'pending'
    );
    order.updateStatus();
    return order;
  }

  public addPayment(amount: number): void {
    if (this.amountPaid + amount > this.total) {
      throw new Error(`Overpayment rejected. Maximum allowed payment is ${(this.total - this.amountPaid) / 100} dollars.`);
    }
    this.amountPaid += amount;
    this.updateStatus();
  }

  public updateDetails(customer: string, dueDate: Date, lineItems: ILineItem[]): void {
    const newSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newTotal = newSubtotal; // Assuming no tax or discount for now

    if (newTotal < this.amountPaid) {
      throw new Error('Cannot reduce order total below the already paid amount.');
    }

    this.customer = customer;
    this.dueDate = dueDate;
    this.lineItems = lineItems;
    this.subtotal = newSubtotal;
    this.total = newTotal;
    
    this.updateStatus();
    this.updatedAt = new Date();
  }

  public updateStatus(): void {
    const isOverdue = this.dueDate < new Date();

    if (this.amountPaid >= this.total) {
      this.status = 'paid';
    } else if (this.amountPaid > 0 && this.amountPaid < this.total) {
      this.status = isOverdue ? 'overdue' : 'partially_paid';
    } else {
      this.status = isOverdue ? 'overdue' : 'pending';
    }
    
    this.amountDue = this.total - this.amountPaid;
  }
}
