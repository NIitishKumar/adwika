import React from 'react';
import { MapPin, Eye } from 'lucide-react';
import { Order } from '../types/order.types';
import { getOrderStatusBadge, getPaymentStatusBadge } from './OrderDetailModal';
import { Button } from '@/components/ui';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  onCancelOrder,
}) => {
  const canCancel =
    order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const previewItems = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;

  return (
    <div className="bg-[#121113] border border-neutral-800/80 p-4 sm:p-5 text-left transition-all hover:border-neutral-700 space-y-4">
      {/* Top Bar: Order Number, Date, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-medium uppercase tracking-wider text-neutral-100">
              #{order.orderNumber}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-[11px] text-neutral-400 font-mono">{formattedDate}</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-sans mt-0.5 flex items-center gap-1">
            <MapPin size={10} className="text-[#c9a87c]" />
            <span>
              {order.shippingAddress.name} · {order.shippingAddress.city},{' '}
              {order.shippingAddress.state}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {getOrderStatusBadge(order.orderStatus)}
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        {previewItems.map((item, idx) => (
          <div
            key={`${item.variantId}-${idx}`}
            className="flex items-center gap-2.5 p-2 bg-[#0c0b0e] border border-neutral-900 shrink-0"
          >
            <img
              src={item.productImageUrl || '/images/default.jpg'}
              alt={item.productName}
              className="w-10 h-13 object-cover bg-neutral-900 border border-neutral-800 shrink-0"
            />
            <div className="max-w-[140px] truncate">
              <p className="text-[11px] font-serif uppercase text-neutral-200 truncate">
                {item.productName}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Qty: {item.quantity} · {item.size || 'Free Size'}
              </p>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="h-13 px-3 flex items-center justify-center bg-[#0c0b0e] border border-neutral-900 text-[11px] text-[#c9a87c] font-mono shrink-0">
            +{remainingCount} more
          </div>
        )}
      </div>

      {/* Footer: Amount & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-900 flex-wrap gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
            Investment Total
          </span>
          <span className="text-sm font-serif font-medium text-white">
            ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && onCancelOrder && (
            <button
              type="button"
              onClick={() => onCancelOrder(order)}
              className="px-3 py-1.5 rounded-full border border-rose-900/40 text-rose-400 hover:bg-rose-950/40 transition-colors text-xs font-sans cursor-pointer"
            >
              Cancel
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1.5 text-xs py-1.5 px-3 border-neutral-700 text-neutral-200 hover:text-white hover:border-[#c9a87c]"
          >
            <Eye size={12} />
            <span>View Receipt</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
