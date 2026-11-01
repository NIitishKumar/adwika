import React from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown, Scissors } from 'lucide-react';
import { FitSize } from '../../types/fitSize.types';
import { StatusBadge } from '../common/StatusBadge';

interface FitSizeTableProps {
  fitSizes: FitSize[];
  onEdit: (fitSize: FitSize) => void;
  onDelete: (fitSize: FitSize) => void;
  onToggleActive: (id: string) => Promise<void>;
  onMoveOrder?: (id: string, direction: 'up' | 'down') => void;
  isLoading?: boolean;
}

export const FitSizeTable: React.FC<FitSizeTableProps> = ({
  fitSizes,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveOrder,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase font-mono">Loading silhouettes...</p>
      </div>
    );
  }

  if (fitSizes.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Scissors size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Fit Sizes Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No garment fit sizes match your current filter. Create a new fit size or reset your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#2e2a27] rounded-lg bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-200 divide-y divide-[#262320]">
        <thead className="bg-[#1a1817] text-[11px] uppercase tracking-wider font-mono text-[#c9a87c]">
          <tr>
            <th scope="col" className="py-3.5 px-4 w-28">
              Order
            </th>
            <th scope="col" className="py-3.5 px-4">
              Fit Name
            </th>
            <th scope="col" className="py-3.5 px-4 w-36">
              Fit Code
            </th>
            <th scope="col" className="py-3.5 px-4 w-36">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {fitSizes.map((fit, index) => (
            <tr
              key={fit.id}
              className="hover:bg-[#1c1a18] transition-colors group"
            >
              {/* Display Order */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                    #{fit.displayOrder}
                  </span>
                  {onMoveOrder && (
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onMoveOrder(fit.id, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveOrder(fit.id, 'down')}
                        disabled={index === fitSizes.length - 1}
                        title="Move Down"
                        className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </td>

              {/* Fit Name */}
              <td className="py-3.5 px-4 font-medium text-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                  <span className="text-sm font-serif tracking-wide">{fit.name}</span>
                </div>
              </td>

              {/* Fit Code */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="font-mono text-xs tracking-wider px-2.5 py-1 rounded bg-[#211d19] border border-[#3a3229] text-[#e0cfba] font-medium">
                  {fit.fitCode}
                </span>
              </td>

              {/* Status Toggle & Badge */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onToggleActive(fit.id)}
                  className="cursor-pointer group/toggle focus:outline-none"
                  title="Click to toggle status"
                >
                  <StatusBadge
                    isActive={fit.isActive}
                    size="sm"
                    className="group-hover/toggle:border-neutral-400 transition-colors"
                  />
                </button>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(fit)}
                    className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                    title="Edit Fit Size"
                    aria-label={`Edit ${fit.name}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(fit)}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Fit Size"
                    aria-label={`Delete ${fit.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
