import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { generateId } from '../utils/uuid';

export interface PricingLineItem {
  id: string;
  name: string;
  price: number;
}

interface Props {
  open: boolean;
  title: string;
  initialItems: PricingLineItem[];
  onClose: () => void;
  onConfirm: (items: PricingLineItem[], total: number) => void;
}

export const SimplePricingModal: React.FC<Props> = ({
  open,
  title,
  initialItems,
  onClose,
  onConfirm,
}) => {
  const [items, setItems] = useState<PricingLineItem[]>(initialItems);

  useEffect(() => {
    if (open) setItems(initialItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updatePrice = (id: string, value: string) => {
    const num = parseFloat(value);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, price: isNaN(num) ? 0 : num } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addCustom = () => {
    setItems((prev) => [...prev, { id: generateId(), name: 'Custom item', price: 0 }]);
  };

  const updateName = (id: string, name: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name } : it)));
  };

  const total = items.reduce((s, it) => s + it.price, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-[#1E3A8A]">{title}</h2>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No items found from this section.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateName(item.id, e.target.value)}
                    className="flex-1 text-xs text-slate-800 bg-transparent border-none outline-none min-w-0"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updatePrice(item.id, e.target.value)}
                      className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-md text-right focus:outline-none focus:border-blue-500"
                      min={0}
                    />
                    <span className="text-xs text-slate-400">ETB</span>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={addCustom}
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            + Add custom item
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="text-sm font-bold text-slate-800">
            Total: <span className="text-teal-600">{total.toLocaleString()} ETB</span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="button"
              onClick={() => { onConfirm(items, total); onClose(); }}
              disabled={items.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Confirm and send to receptionist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
