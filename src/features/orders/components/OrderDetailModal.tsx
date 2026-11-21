import React from 'react';
import { Modal, Button } from '@/components/ui';
import { MapPin, Package, ShieldCheck, CreditCard, Ban } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../types/order.types';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOpenCancelModal?: (order: Order) => void;
}

export const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-700/60 text-[10px] font-mono uppercase text-blue-300">
          Confirmed
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/60 text-[10px] font-mono uppercase text-amber-300">
          In Atelier Crafting
        </span>
      );
    case 'SHIPPED':
      return (
        <span className="px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-700/60 text-[10px] font-mono uppercase text-purple-300">
          Dispatched / En Route
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300">
          Delivered
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-700/60 text-[10px] font-mono uppercase text-rose-300">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-mono uppercase text-neutral-300">
          {status}
        </span>
      );
  }
};

export const getPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'PAID':
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-700/40 text-[9px] font-mono uppercase text-emerald-400">
          Paid
        </span>
      );
    case 'FAILED':
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-950/50 border border-rose-700/40 text-[9px] font-mono uppercase text-rose-400">
          Payment Failed
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-700/40 text-[9px] font-mono uppercase text-amber-400">
          Payment Pending
        </span>
      );
  }
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onOpenCancelModal,
}) => {
  if (!order) return null;

  const canCancel = order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="text-left space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[#c9a87c]" />
              <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-100">
                Order #{order.orderNumber}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              Placed on {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {getOrderStatusBadge(order.orderStatus)}
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        {/* Cancellation Notice if Cancelled */}
        {order.orderStatus === 'CANCELLED' && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded flex items-start gap-2.5 text-xs text-rose-200">
            <Ban size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Consignment Cancelled</p>
              {order.cancellationReason && (
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  Reason: {order.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono mb-3">
            Reserved Pieces ({order.items.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div
                key={`${item.variantId}-${idx}`}
                className="flex items-center gap-3.5 p-3 bg-[#121113] border border-neutral-800/80"
              >
                <img
                  src={item.productImageUrl || '/images/default.jpg'}
                  alt={item.productName}
                  className="w-14 h-18 object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-serif text-neutral-100 uppercase truncate">
                    {item.productName}
                  </h5>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400 flex-wrap">
                    {item.color && (
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full border border-black/40"
                          style={{ backgroundColor: item.colorCode || '#888' }}
                        />
                        <span>{item.color}</span>
                      </span>
                    )}
                    {item.size && <span className="font-mono">· {item.size}</span>}
                    {item.sku && <span className="font-mono text-neutral-500">· {item.sku}</span>}
                  </div>
                  {item.customizationNotes && (
                    <p className="text-[10px] text-[#c9a87c] italic mt-1">
                      Note: {item.customizationNotes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-serif text-neutral-200">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Shipping Address */}
          <div className="p-4 bg-[#121113] border border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#c9a87c] mb-1">
              <MapPin size={12} />
              <span>Consignment Destination</span>
            </div>
            <p className="font-serif font-medium text-neutral-100 uppercase text-xs">
              {order.shippingAddress.name}
            </p>
            <p className="text-neutral-400 text-[11px]">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
            </p>
            <p className="text-neutral-400 text-[11px]">
              {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
              <span className="font-mono text-neutral-300">
                {order.shippingAddress.postalCode}
              </span>
            </p>
            <p className="text-neutral-500 font-mono text-[10px] pt-1">
              +91 {order.shippingAddress.phone}
            </p>
          </div>

          {/* Payment Details & Price Breakdown */}
          <div className="p-4 bg-[#121113] border border-neutral-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#c9a87c] mb-1">
              <CreditCard size={12} />
              <span>Payment & Investment</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Payment Mode</span>
              <span className="font-mono uppercase text-neutral-200">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Subtotal</span>
              <span className="font-mono text-neutral-200">
                ₹{order.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400 text-[11px]">
                <span>Privilege Savings</span>
                <span className="font-mono">- ₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Insured Courier</span>
              <span className="text-[#c9a87c] uppercase text-[10px]">
                {order.shippingFee === 0 ? 'Complimentary' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-neutral-800 font-medium">
              <span className="uppercase tracking-wider text-neutral-200 text-xs">Total Amount</span>
              <span className="text-base font-serif text-white">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
            <ShieldCheck size={13} className="text-[#c9a87c]" />
            <span>Adwika Certified Authenticity</span>
          </div>

          <div className="flex items-center gap-3">
            {canCancel && onOpenCancelModal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenCancelModal(order);
                }}
                className="text-rose-400 border-rose-900/60 hover:bg-rose-950/40 text-xs"
              >
                Cancel Order
              </Button>
            )}
            <Button type="button" variant="filled" size="sm" onClick={onClose} className="text-xs">
              Close Receipt
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
