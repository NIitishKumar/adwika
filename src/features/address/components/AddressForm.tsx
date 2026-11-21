import React, { useState } from 'react';
import { CreateAddressDto, UpdateAddressDto, UserAddress, AddressType } from '../types/address.types';
import { Button } from '@/components/ui';
import { X, Sparkles, Home, Briefcase, MapPin } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface AddressFormProps {
  initialData?: UserAddress | null;
  onSubmit: (dto: CreateAddressDto | UpdateAddressDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    landmark: initialData?.landmark || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Karnataka',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'India',
    addressType: (initialData?.addressType || 'HOME') as AddressType,
    isDefault: initialData?.isDefault ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile phone is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City / District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    const cleanPin = formData.postalCode.replace(/\D/g, '');
    if (!cleanPin) {
      newErrors.postalCode = 'PIN / Postal Code is required';
    } else if (cleanPin.length !== 6) {
      newErrors.postalCode = 'Enter a valid 6-digit postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone.trim() || undefined,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      landmark: formData.landmark.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim() || 'India',
      addressType: formData.addressType,
      isDefault: formData.isDefault,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121113] border border-[#2b2521] p-5 sm:p-7 space-y-5 animate-fadeIn"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#c9a87c]" />
          <h3 className="font-serif text-sm uppercase tracking-wider text-neutral-100">
            {initialData ? 'Modify Delivery Address' : 'Add Temporary / Delivery Address'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-neutral-500 hover:text-white transition-colors p-1"
          aria-label="Cancel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Recipient Full Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Recipient Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Nitish Kumar"
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors"
          />
          {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Mobile Number (for Courier) <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center">
            <span className="bg-[#161413] border border-r-0 border-neutral-800 px-2.5 py-2.5 text-xs text-neutral-400 font-mono">
              +91
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              maxLength={12}
              className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors font-mono"
            />
          </div>
          {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Street Address Line 1 */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
          Address Line 1 (Flat, House no., Building, Street) <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          placeholder="e.g. Flat 402, Royal Residency, 100 Feet Road"
          className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors"
        />
        {errors.addressLine1 && (
          <p className="text-[10px] text-rose-400 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Street Address Line 2 & Landmark */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Address Line 2 (Area, Colony, Road) <span className="text-neutral-600">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            placeholder="e.g. Indiranagar Stage 2"
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Landmark <span className="text-neutral-600">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            placeholder="e.g. Near Metro Station"
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors"
          />
        </div>
      </div>

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            City / District <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. Bengaluru"
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors"
          />
          {errors.city && <p className="text-[10px] text-rose-400 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            State <span className="text-rose-400">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 outline-none transition-colors"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st} className="bg-[#121113] text-neutral-200">
                {st}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-[10px] text-rose-400 mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Postal Code (PIN) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="560038"
            maxLength={6}
            className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors font-mono"
          />
          {errors.postalCode && (
            <p className="text-[10px] text-rose-400 mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Address Type Tag & Alternate Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Address Type
          </label>
          <div className="flex items-center gap-2">
            {(
              [
                { type: 'HOME', label: 'Home', icon: Home },
                { type: 'WORK', label: 'Work', icon: Briefcase },
                { type: 'OTHER', label: 'Other', icon: MapPin },
              ] as const
            ).map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, addressType: type })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border text-xs uppercase tracking-wider transition-colors ${
                  formData.addressType === type
                    ? 'bg-[#201c18] border-[#c9a87c] text-[#c9a87c]'
                    : 'bg-[#0a0a0c] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5 font-sans">
            Alternate Phone <span className="text-neutral-600">(Optional)</span>
          </label>
          <div className="flex items-center">
            <span className="bg-[#161413] border border-r-0 border-neutral-800 px-2.5 py-2.5 text-xs text-neutral-400 font-mono">
              +91
            </span>
            <input
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="9876543211"
              maxLength={12}
              className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 outline-none transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Set Default Checkbox */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="w-4 h-4 accent-[#c9a87c] rounded-none bg-neutral-900 border-neutral-700"
          />
          <span className="text-xs text-neutral-300">
            Set as default delivery address for future consignments
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-900">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="filled"
          size="sm"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Address' : 'Deliver to This Address'}
        </Button>
      </div>
    </form>
  );
};
