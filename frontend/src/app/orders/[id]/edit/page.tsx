"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/ui/Layout";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types";

interface FormLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in dollars for input, converted to cents for API
}

export default function EditOrder() {
  const router = useRouter();
  const { id } = useParams();
  const [customer, setCustomer] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        const order: Order = data.data.order;
        setCustomer(order.customer);
        // Ensure date is formatted properly for input[type="date"]
        setDueDate(new Date(order.dueDate).toISOString().split('T')[0]);
        setLineItems(
          order.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100 // convert back to dollars for form
          }))
        );
      } catch {
        toast.error("Failed to load order details");
        router.push(`/orders/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchOrder();
    }
  }, [id, router]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    setLineItems(newItems);
  };

  const updateLineItem = (index: number, field: keyof FormLineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    // Convert prices to cents for API
    const apiLineItems = lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Math.round(Number(item.unitPrice) * 100),
    }));

    try {
      setIsSubmitting(true);
      await api.put(`/orders/${id}`, {
        customer,
        dueDate: new Date(dueDate).toISOString(),
        lineItems: apiLineItems,
      });
      toast.success("Order updated successfully!");
      router.push(`/orders/${id}`);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to update order");
      } else {
        toast.error("Failed to update order");
      }
    } finally {
      setIsSubmitting(false);
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

  return (
    <AppLayout>
      <div className="mb-8">
        <Link href={`/orders/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Order
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Order</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-slate-700">
                Customer Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="customer"
                  id="customer"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">
                Due Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-slate-900">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      className="block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Item name"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
                      className="block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, "unitPrice", Number(e.target.value))}
                      className="block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-32 text-right pt-5">
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency((item.quantity * item.unitPrice) * 100)}
                    </span>
                  </div>
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-50 transition-colors rounded-md"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6 flex justify-end">
              <dl className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between w-64">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-slate-900">{formatCurrency(subtotal * 100)}</dd>
                </div>
                <div className="flex justify-between w-64 border-t border-slate-200 pt-3 text-base">
                  <dt className="font-medium text-slate-900">Total</dt>
                  <dd className="font-bold text-indigo-600">{formatCurrency(subtotal * 100)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex justify-end gap-3">
            <Link
              href={`/orders/${id}`}
              className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
