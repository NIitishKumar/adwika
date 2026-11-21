import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyConfig } from '@/types';
import { Order } from '../types/order.types';
import { orderService } from '../services/order.service';
import { OrderCard } from '../components/OrderCard';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { Button } from '@/components/ui';
import { Package, ArrowLeft, Loader2, Sparkles, Inbox } from 'lucide-react';
import { showToast } from '@/config/toast.config';
import { isLoggedIn } from '@/config/auth.config';

interface MyOrdersPageProps {
  currency?: CurrencyConfig;
  onOpenAccountModal?: () => void;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'In Crafting', value: 'PROCESSING' },
  { label: 'En Route', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onOpenAccountModal }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  const loggedIn = isLoggedIn();

  const fetchOrders = useCallback(async () => {
    if (!loggedIn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await orderService.getMyOrders(
        activeFilter !== 'ALL' ? { orderStatus: activeFilter } : undefined
      );
      setOrders(list);
    } catch (err: any) {
      console.error('Failed to fetch user orders:', err);
      showToast({
        type: 'error',
        title: 'Unable to Load Orders',
        message: err?.message || 'Could not retrieve your orders from the atelier server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, loggedIn]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmCancel = async (orderId: string, reason: string) => {
    try {
      const updated = await orderService.cancelOrder(orderId, reason);
      showToast({
        type: 'success',
        title: 'Consignment Cancelled',
        message: `Order #${updated.orderNumber} has been successfully cancelled.`,
      });
      await fetchOrders();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err?.message || 'Unable to cancel this order. Please reach out to concierge.',
      });
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col pt-6 pb-20">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 mb-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-widest text-[11px]">Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c9a87c] flex items-center gap-1.5 mb-1">
              <Sparkles size={12} />
              Atelier Client Sanctuary
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider text-neutral-100">
              My Orders & Consignments
            </h1>
          </div>

          <span className="text-xs text-neutral-400 font-mono">
            {orders.length} {orders.length === 1 ? 'Consignment' : 'Consignments'}
          </span>
        </div>

        {/* Filter Pills */}
        {loggedIn && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap uppercase tracking-wider transition-colors ${
                  activeFilter === f.value
                    ? 'bg-[#c9a87c] text-black font-medium'
                    : 'bg-[#141315] border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1">
        {!loggedIn ? (
          <div className="max-w-md mx-auto py-20 px-6 text-center flex flex-col items-center gap-4 bg-[#121113] border border-neutral-800">
            <div className="w-14 h-14 rounded-full bg-[#1c1815] border border-[#c9a87c]/30 flex items-center justify-center text-[#c9a87c]">
              <Package size={24} />
            </div>
            <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-100">
              Authentication Required
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Please sign in to your atelier account to review your personal consignment history, track hand-dispatched heirlooms, and manage your orders.
            </p>
            {onOpenAccountModal && (
              <Button
                variant="filled"
                size="md"
                onClick={onOpenAccountModal}
                className="mt-3 px-8 text-xs uppercase tracking-widest"
              >
                Sign In to View Orders
              </Button>
            )}
          </div>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 size={28} className="animate-spin text-[#c9a87c]" />
            <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
              Retrieving Atelier Consignments...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center gap-4 bg-[#121113] border border-neutral-800/80">
            <div className="w-14 h-14 rounded-full bg-[#181513] border border-neutral-800 flex items-center justify-center text-neutral-500">
              <Inbox size={26} />
            </div>
            <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-200">
              No Consignments Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              {activeFilter !== 'ALL'
                ? `You have no orders currently in "${activeFilter.toLowerCase()}" status.`
                : 'You have not welcomed any Adwika pieces into your personal collection yet.'}
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/')}
              className="mt-3 px-8 text-xs uppercase tracking-widest border-[#3d332a] text-[#c9a87c] hover:bg-[#1a1714]"
            >
              Explore The Collection ↗
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id || order.uniqueId || order.orderNumber}
                order={order}
                onViewDetails={(ord) => setSelectedOrder(ord)}
                onCancelOrder={(ord) => setCancellingOrder(ord)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOpenCancelModal={(ord) => setCancellingOrder(ord)}
      />

      <CancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        onClose={() => setCancellingOrder(null)}
        order={cancellingOrder}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default MyOrdersPage;
