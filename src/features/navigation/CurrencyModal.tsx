import React from 'react';
import { Modal } from '@/components/ui';
import { REGIONS } from '@/data/products';
import { RegionOption } from '@/types';
import { Check } from 'lucide-react';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: RegionOption;
  onSelectRegion: (region: RegionOption) => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Region & Currency">
      <p className="text-xs text-neutral-400 text-center mb-6">
        Prices, customs and shipping will be adjusted based on your selected regional destination.
      </p>

      <div className="flex flex-col gap-2">
        {REGIONS.map((region) => {
          const isSelected = selectedRegion.country === region.country;
          return (
            <button
              key={region.country}
              onClick={() => {
                onSelectRegion(region);
                onClose();
              }}
              className={`flex items-center justify-between p-4 border transition-all text-left ${
                isSelected
                  ? 'border-adwika-sand bg-white/5 text-white'
                  : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <p className="text-sm tracking-wider font-serif uppercase">{region.country}</p>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Currency: {region.currency} ({region.symbol})
                </p>
              </div>

              {isSelected && <Check size={18} className="text-adwika-sand" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
