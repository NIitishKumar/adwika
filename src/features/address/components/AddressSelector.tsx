import React, { useState, useEffect, useRef } from 'react';
import { UserAddress, CreateAddressDto, UpdateAddressDto } from '../types/address.types';
import { addressService } from '../services/address.service';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { Button } from '@/components/ui';
import { Plus, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { showToast } from '@/config/toast.config';

interface AddressSelectorProps {
  selectedAddressId?: string | null;
  onSelectAddress: (address: UserAddress | null) => void;
  className?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
  className,
}) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const onSelectAddressRef = useRef(onSelectAddress);
  const selectedAddressIdRef = useRef(selectedAddressId);

  useEffect(() => {
    onSelectAddressRef.current = onSelectAddress;
    selectedAddressIdRef.current = selectedAddressId;
  });

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);

      // Auto-select default or first address only if no address is currently selected
      if (!selectedAddressIdRef.current && list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        onSelectAddressRef.current(defaultAddr);
      }
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err);
      showToast({
        type: 'error',
        title: 'Error Fetching Addresses',
        message: err?.message || 'Could not load your saved addresses from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run ONLY ONCE on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreate = async (dto: CreateAddressDto | UpdateAddressDto) => {
    setIsSubmitting(true);
    try {
      const created = await addressService.createAddress(dto as CreateAddressDto);
      showToast({
        type: 'success',
        title: 'Address Saved',
        message: 'Delivery address has been saved successfully.',
      });
      setIsAddingNew(false);
      onSelectAddressRef.current(created);
      await fetchAddresses();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Unable to Save Address',
        message: err?.message || 'Could not save delivery address.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (dto: CreateAddressDto | UpdateAddressDto) => {
    if (!editingAddress) return;
    setIsSubmitting(true);
    try {
      const updated = await addressService.updateAddress(editingAddress.id, dto);
      showToast({
        type: 'success',
        title: 'Address Updated',
        message: 'Delivery address updated successfully.',
      });
      setEditingAddress(null);
      if (
        selectedAddressIdRef.current === updated.id ||
        selectedAddressIdRef.current === updated.uniqueId
      ) {
        onSelectAddressRef.current(updated);
      }
      await fetchAddresses();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update delivery address.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    setBusyAddressId(addr.id);
    try {
      await addressService.setDefaultAddress(addr.id);
      showToast({
        type: 'success',
        title: 'Default Address Set',
        message: `${addr.name}'s address is now your primary delivery destination.`,
      });
      await fetchAddresses();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.message || 'Could not set default address.',
      });
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleDelete = async (addr: UserAddress) => {
    if (!window.confirm(`Remove address for "${addr.name}"?`)) return;
    setBusyAddressId(addr.id);
    try {
      await addressService.deleteAddress(addr.id);
      showToast({
        type: 'success',
        title: 'Address Removed',
        message: 'The address has been removed.',
      });
      if (
        selectedAddressIdRef.current === addr.id ||
        selectedAddressIdRef.current === addr.uniqueId
      ) {
        onSelectAddressRef.current(null);
      }
      await fetchAddresses();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.message || 'Could not delete address.',
      });
    } finally {
      setBusyAddressId(null);
    }
  };

  return (
    <div className={className}>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-base uppercase tracking-wider text-neutral-100 flex items-center gap-2">
            <MapPin size={16} className="text-[#c9a87c]" />
            <span>Select Delivery Address</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose where your handcrafted heirloom should be consigned.
          </p>
        </div>

        {!isAddingNew && !editingAddress && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 text-xs py-2 px-3 border-[#3d332a] text-[#c9a87c] hover:bg-[#1a1714]"
          >
            <Plus size={13} />
            <span>Add New</span>
          </Button>
        )}
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <div className="mb-6">
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddingNew(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Edit Form */}
      {editingAddress && (
        <div className="mb-6">
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAddress(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Addresses List / Loading */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 size={24} className="animate-spin text-[#c9a87c]" />
          <span className="text-xs uppercase tracking-widest font-sans">
            Retrieving Delivery Addresses...
          </span>
        </div>
      ) : addresses.length === 0 && !isAddingNew ? (
        <div className="py-10 px-6 border border-dashed border-neutral-800 text-center flex flex-col items-center gap-3">
          <AlertCircle size={32} className="text-[#c9a87c]" />
          <p className="text-xs text-neutral-300 font-serif uppercase tracking-wide">
            No saved delivery address found
          </p>
          <p className="text-xs text-neutral-500 max-w-sm">
            Please enter your shipping address details to proceed with your consignment reservation.
          </p>
          <Button
            variant="filled"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="mt-2"
          >
            + Add Delivery Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected =
              selectedAddressId === address.id || selectedAddressId === address.uniqueId;
            return (
              <AddressCard
                key={address.id || address.uniqueId}
                address={address}
                isSelected={isSelected}
                isBusy={busyAddressId === address.id}
                onSelect={() => onSelectAddress(address)}
                onEdit={() => {
                  setIsAddingNew(false);
                  setEditingAddress(address);
                }}
                onDelete={() => handleDelete(address)}
                onSetDefault={() => handleSetDefault(address)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
