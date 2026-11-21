import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Loader2,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  orderService,
  OrderDetailModal,
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from '@/features/orders';
import { Modal, Button } from '@/components/ui';
import { showToast } from '@/config/toast.config';

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Crafting', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Edit status form state
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('CONFIRMED');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await orderService.getMyOrders(
        statusFilter !== 'ALL' ? { orderStatus: statusFilter } : undefined
      );
      setOrders(list);
    } catch (err: any) {
      console.error('Failed to load orders for admin:', err);
      showToast({
        type: 'error',
        title: 'Error Loading Orders',
        message: err?.message || 'Could not fetch orders list.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Payment filter
      if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesName = order.shippingAddress.name.toLowerCase().includes(q);
        const matchesPhone = order.shippingAddress.phone.includes(q);
        const matchesCity = order.shippingAddress.city.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesPhone && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [orders, paymentFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = orders.length;
    const pendingFulfillment = orders.filter(
      (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING'
    ).length;
    const shipped = orders.filter((o) => o.orderStatus === 'SHIPPED').length;
    const delivered = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const revenue = orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pendingFulfillment, shipped, delivered, revenue };
  }, [orders]);

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await orderService.updateOrderStatus(
        editingOrder.id || editingOrder.orderNumber,
        {
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }
      );

      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order #${updated.orderNumber} updated to ${updated.orderStatus}.`,
      });

      setEditingOrder(null);
      await fetchOrders();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update order status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Package size={18} />
            </span>
            <h1 className="font-serif text-2xl uppercase tracking-wider text-neutral-100">
              Orders Management
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Review customer consignments, track dispatch pipelines, and update fulfillment statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono"
          title="Refresh Orders"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono block mb-1">
            Total Consignments
          </span>
          <span className="text-xl font-serif text-neutral-100 font-medium">
            {metrics.total}
          </span>
        </div>

        <div className="p-4 rounded bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono block mb-1">
            Pending Fulfillment
          </span>
          <span className="text-xl font-serif text-amber-300 font-medium">
            {metrics.pendingFulfillment}
          </span>
        </div>

        <div className="p-4 rounded bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest text-purple-400 font-mono block mb-1">
            In Transit / Shipped
          </span>
          <span className="text-xl font-serif text-purple-300 font-medium">
            {metrics.shipped}
          </span>
        </div>

        <div className="p-4 rounded bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono block mb-1">
            Delivered
          </span>
          <span className="text-xl font-serif text-emerald-300 font-medium">
            {metrics.delivered}
          </span>
        </div>

        <div className="p-4 rounded bg-[#141414] border border-[#2b2723] col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase tracking-widest text-[#c9a87c] font-mono block mb-1">
            Gross Order Value
          </span>
          <span className="text-xl font-serif text-[#e0cfba] font-medium">
            ₹{metrics.revenue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded bg-[#141414] border border-[#2b2723] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#29221b] text-[#e0cfba] font-medium border border-[#4d3a2b]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1a1816]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Payment Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #order, name, city..."
              className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded px-2.5 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-[#2e2a27] rounded bg-[#141414] shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 size={32} className="animate-spin text-[#c9a87c] mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Loading Consignments...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={36} className="text-neutral-600 mx-auto mb-3" />
            <p className="font-serif text-base uppercase tracking-wider text-neutral-300">
              No Orders Found
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              No customer consignments match your current filters.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1b1917] border-b border-[#2e2a27] text-neutral-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Pieces</th>
                <th className="py-3 px-4">Investment</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24201d]">
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={order.id || order.orderNumber} className="hover:bg-[#181614] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-neutral-200">
                      <div>#{order.orderNumber}</div>
                      <div className="text-[10px] text-neutral-500">{dateStr}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-serif text-neutral-200 uppercase font-medium">
                        {order.shippingAddress.name}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        +91 {order.shippingAddress.phone}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-neutral-300">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[160px]">
                        {order.items[0]?.productName || 'Garment'}
                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-serif font-medium text-neutral-100">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono uppercase text-[10px] text-neutral-300 mb-1">
                        {order.paymentMethod}
                      </div>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>

                    <td className="py-3 px-4">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#24201c] rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(order)}
                          className="p-1.5 text-[#c9a87c] hover:text-[#e0cfba] hover:bg-[#24201c] rounded transition-colors"
                          title="Update Status"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Receipt Modal */}
      <OrderDetailModal
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
      />

      {/* Edit Status Modal */}
      {editingOrder && (
        <Modal
          isOpen={Boolean(editingOrder)}
          onClose={() => setEditingOrder(null)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveStatusUpdate} className="text-left space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <Edit size={16} className="text-[#c9a87c]" />
              <h3 className="font-serif text-base uppercase tracking-wider text-neutral-100">
                Update Consignment #{editingOrder.orderNumber}
              </h3>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
                Order Fulfillment Status
              </label>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded p-2.5 text-xs text-neutral-200 outline-none"
              >
                <option value="CONFIRMED">CONFIRMED (Awaiting Dispatch)</option>
                <option value="PROCESSING">PROCESSING (In Atelier Crafting)</option>
                <option value="SHIPPED">SHIPPED (En Route / Courier Dispatched)</option>
                <option value="DELIVERED">DELIVERED (Safely Received)</option>
                <option value="CANCELLED">CANCELLED (Consignment Terminated)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
                Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded p-2.5 text-xs text-neutral-200 outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingOrder(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="filled"
                size="sm"
                isLoading={isUpdatingStatus}
              >
                Save Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminOrdersPage;
