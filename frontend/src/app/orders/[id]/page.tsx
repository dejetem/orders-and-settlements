"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/ui/Layout";
import { api } from "@/lib/api";
import { Order, Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Clock, CheckCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    partially_paid: "bg-blue-100 text-blue-800",
    paid: "bg-emerald-100 text-emerald-800",
    overdue: "bg-rose-100 text-rose-800",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    partially_paid: "Partial",
    paid: "Paid",
    overdue: "Overdue",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogTotalPages, setAuditLogTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data.order);
      setPayments(data.data.payments);

    } catch (error) {
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!id) return;
    try {
      const auditRes = await api.get(`/orders/${id}/audit-logs?page=${auditLogPage}&limit=5`);
      setAuditLogs(auditRes.data.data.items || []);
      setAuditLogTotalPages(auditRes.data.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    fetchAuditLogs();
  }, [id, auditLogPage]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const amountInCents = Math.round(Number(paymentAmount) * 100);

    if (amountInCents <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);
      const idempotencyKey = uuidv4();
      await api.post(`/orders/${id}/payments`, {
        amount: amountInCents,
        note: paymentNote,
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      toast.success("Payment recorded successfully!");
      setPaymentAmount("");
      setPaymentNote("");
      // Refresh order to get new status and amounts, and reset audit log page to show latest
      fetchOrder();
      setAuditLogPage(1);
      fetchAuditLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    try {
      setIsDeleting(true);
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete order");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500">Loading order details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Order not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order from {order.customer}</h1>
            <p className="mt-1 text-sm text-slate-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Created on {formatDate(order.createdAt)} • Due on {formatDate(order.dueDate)}
            </p>
          </div>
          <div>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            href={`/orders/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
          >
            <Edit className="w-4 h-4 mr-2 text-slate-500" />
            Edit Order
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting || order.amountPaid > 0}
            title={order.amountPaid > 0 ? "Cannot delete an order with payments" : "Delete Order"}
            className="inline-flex items-center px-4 py-2 border border-rose-300 shadow-sm text-sm font-medium rounded-lg text-rose-700 bg-white hover:bg-rose-50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
            {isDeleting ? "Deleting..." : "Delete Order"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items and Payments */}
        <div className="lg:col-span-2 space-y-8">

          {/* Line Items */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-medium text-slate-900">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {order.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-slate-900">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment History */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-medium text-slate-900">Payment History</h2>
            </div>
            {payments.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No payments recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <li key={payment.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(payment.date)}
                        </p>
                        {payment.note && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                            "{payment.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Order History / Audit Logs */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-medium text-slate-900">Order History</h2>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No history recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <li key={log._id || log.id || Math.random()} className="p-6 flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></div>
                    </div>
                    <div className="ml-4 w-full">
                      <p className="text-sm font-medium text-slate-900">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 bg-slate-50 p-3 rounded-md border border-slate-100 overflow-x-auto text-xs text-slate-600 font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {auditLogTotalPages > 1 && (
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setAuditLogPage(p => Math.max(1, p - 1))}
                  disabled={auditLogPage === 1}
                  className="relative inline-flex items-center px-3 py-1 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {auditLogPage} of {auditLogTotalPages}
                </span>
                <button
                  onClick={() => setAuditLogPage(p => Math.min(auditLogTotalPages, p + 1))}
                  disabled={auditLogPage === auditLogTotalPages}
                  className="relative inline-flex items-center px-3 py-1 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Summary & Payment Form */}
        <div className="space-y-8">

          {/* Summary Card */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Summary</h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500">Order Total</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(order.total)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500">Amount Paid</dt>
                <dd className="font-medium text-emerald-600">{formatCurrency(order.amountPaid)}</dd>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <dt className="text-base font-medium text-slate-900">Amount Due</dt>
                <dd className="text-xl font-bold text-indigo-600">{formatCurrency(order.amountDue)}</dd>
              </div>
            </dl>
          </section>

          {/* Record Payment Form */}
          {order.amountDue > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-lg font-medium text-slate-900">Record Payment</h2>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                    Amount ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      required
                      min="0.01"
                      step="0.01"
                      max={order.amountDue / 100}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-slate-300 rounded-md py-2 border"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Max: {formatCurrency(order.amountDue)}
                  </p>
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                    Note (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="note"
                      name="note"
                      rows={2}
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-slate-300 rounded-md py-2 px-3"
                      placeholder="e.g. Bank transfer ref 12345"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Recording..." : "Submit Payment"}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
