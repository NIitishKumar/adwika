import React from 'react';
import { Home, Briefcase, MapPin, Check, Phone, Edit2, Trash2, Star } from 'lucide-react';
import { UserAddress } from '../types/address.types';
import { cn } from '@/lib/utils';

interface AddressCardProps {
  address: UserAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  isBusy?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isBusy = false,
}) => {
  const getTypeIcon = () => {
    switch (address.addressType) {
      case 'WORK':
        return <Briefcase size={11} className="text-[#c9a87c]" />;
      case 'HOME':
        return <Home size={11} className="text-[#c9a87c]" />;
      default:
        return <MapPin size={11} className="text-[#c9a87c]" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative p-4 sm:p-5 rounded-none border transition-all duration-200 cursor-pointer text-left',
        isSelected
          ? 'bg-[#181513] border-[#c9a87c] shadow-[0_0_20px_rgba(201,168,124,0.12)]'
          : 'bg-[#121113]/80 border-neutral-800 hover:border-neutral-700 hover:bg-[#141315]',
        isBusy && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Radio indicator */}
          <div
            className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
              isSelected
                ? 'border-[#c9a87c] bg-[#c9a87c]'
                : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-500'
            )}
          >
            {isSelected && <Check size={10} className="text-black stroke-[3]" />}
          </div>

          {/* Recipient Name */}
          <h4 className="font-serif tracking-wide text-neutral-100 uppercase text-sm font-medium">
            {address.name}
          </h4>

          {/* Address Type Pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#201c18] border border-[#3d332a] text-[10px] font-sans tracking-wider uppercase text-neutral-300">
            {getTypeIcon()}
            <span>{address.addressType}</span>
          </span>

          {/* Default Badge */}
          {address.isDefault && (
            <span className="px-2 py-0.5 rounded-full bg-[#c9a87c]/10 border border-[#c9a87c]/30 text-[9px] font-sans tracking-widest uppercase text-[#c9a87c]">
              Default
            </span>
          )}
        </div>

        {/* Quick action icons */}
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {onSetDefault && !address.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              title="Set as Default"
              className="p-1.5 text-neutral-500 hover:text-[#c9a87c] transition-colors rounded hover:bg-neutral-800"
            >
              <Star size={13} />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit Address"
              className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors rounded hover:bg-neutral-800"
            >
              <Edit2 size={13} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete Address"
              className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors rounded hover:bg-neutral-800"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Street Address */}
      <div className="text-xs text-neutral-300 leading-relaxed pl-6 space-y-0.5">
        <p className="font-sans text-neutral-200">{address.addressLine1}</p>
        {(address.addressLine2 || address.landmark) && (
          <p className="text-neutral-400 text-[11px]">
            {[address.addressLine2, address.landmark && `Landmark: ${address.landmark}`]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        <p className="text-neutral-400 font-sans text-[11px]">
          {address.city}, {address.state} — <span className="font-mono text-neutral-300">{address.postalCode}</span>
        </p>
        <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
          {address.country || 'India'}
        </p>
      </div>

      {/* Contact Phone */}
      <div className="mt-3 pt-2.5 border-t border-neutral-900/80 flex items-center gap-2 pl-6 text-xs text-neutral-400 font-mono">
        <Phone size={12} className="text-[#c9a87c]" />
        <span>+91 {address.phone}</span>
        {address.alternatePhone && (
          <span className="text-[10px] text-neutral-500">
            · Alt: +91 {address.alternatePhone}
          </span>
        )}
      </div>
    </div>
  );
};
