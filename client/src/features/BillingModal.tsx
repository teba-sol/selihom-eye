import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../utils/uuid';

export interface BillingItem {
  id: string;
  name: string;
  price: number;
}

export interface BillingLineItem {
  id: string;
  name: string;
  price: number;
}

const PRICE_LIST: BillingItem[] = [
  { id: '1',  name: 'Card (Examination by ON)',                    price: 50   },
  { id: '2',  name: 'Card (Examination by Senior) for Credit',     price: 70   },
  { id: '3',  name: 'Card (Examination by Senior)',                price: 80   },
  { id: '4',  name: 'Dilated Fundus Examination one eye',          price: 100  },
  { id: '5',  name: 'Dilated Fundus Examination both eyes',        price: 200  },
  { id: '6',  name: 'Gonioscopy',                                  price: 100  },
  { id: '7',  name: 'Refraction near',                             price: 200  },
  { id: '8',  name: 'Refraction Distance',                         price: 400  },
  { id: '9',  name: 'Patching',                                    price: 100  },
  { id: '10', name: 'Irrigation and probing',                      price: 200  },
  { id: '11', name: 'Irrigation for chemical injury (minor)',      price: 200  },
  { id: '12', name: 'Irrigation for chemical injury (major)',      price: 300  },
  { id: '13', name: 'Epilation',                                   price: 100  },
  { id: '14', name: 'Tarsotomy upper lid',                         price: 1500 },
  { id: '15', name: 'Tarsotomy lower lid',                         price: 2500 },
  { id: '16', name: 'Tarsorhaphy',                                 price: 800  },
  { id: '17', name: 'Lid repair — minor',                          price: 800  },
  { id: '18', name: 'Lid repair major',                            price: 1500 },
  { id: '19', name: 'Lid mass excision — small',                   price: 800  },
  { id: '20', name: 'Lid mass excision — large',                   price: 1200 },
  { id: '21', name: 'Chalazion – I&C',                             price: 500  },
  { id: '22', name: 'Incision and drainage',                       price: 800  },
  { id: '23', name: 'Ectropion correction',                        price: 2000 },
  { id: '24', name: 'Skin graft',                                  price: 4000 },
  { id: '25', name: 'Pterygium with autograft',                    price: 3000 },
  { id: '26', name: 'Conjunctival mass excision small',            price: 800  },
  { id: '27', name: 'Conjunctival mass excision large',            price: 1000 },
  { id: '28', name: 'Conjunctival foreign body',                   price: 200  },
  { id: '29', name: 'Conjunctival repair',                         price: 800  },
  { id: '30', name: 'Symblepharon release',                        price: 1000 },
  { id: '31', name: 'Concretion removal',                          price: 150  },
  { id: '32', name: 'Corneal foreign body',                        price: 200  },
  { id: '33', name: 'Evisceration',                                price: 800  },
  { id: '34', name: 'Enucleation',                                 price: 1500 },
  { id: '35', name: 'Prosthesis',                                  price: 5000 },
  { id: '36', name: 'SICS PC/AC IOL',                              price: 5000 },
  { id: '37', name: 'SICS PC/AC IOL (traumatic)',                  price: 5000 },
  { id: '38', name: 'SICS only',                                   price: 4000 },
  { id: '39', name: 'Trabeculectomy',                              price: 5000 },
  { id: '40', name: 'Trabeculectomy + SICS PC IOL',               price: 6000 },
  { id: '41', name: 'Sectoral iridectomy',                         price: 2500 },
  { id: '42', name: 'Corneoscleral Tear Repair (small)',           price: 2500 },
  { id: '43', name: 'Corneoscleral Tear Repair (large)',           price: 3500 },
  { id: '44', name: 'Corneoscleral + Lens Washout',                price: 6000 },
  { id: '45', name: 'Hyphemia washout',                            price: 2000 },
  { id: '46', name: 'DCR',                                         price: 6000 },
  { id: '47', name: 'Strabismus surgery',                          price: 6000 },
  { id: '48', name: 'Subconj Gentamycin',                          price: 100  },
  { id: '49', name: 'Intravitreal injection',                      price: 500  },
  { id: '50', name: 'Retrobulbar Alcohol/CPZ',                     price: 300  },
  { id: '51', name: 'Disthichiasis Repair',                        price: 3000 },
  { id: '52', name: 'Stitch Removal',                              price: 100  },
  { id: '53', name: 'IOP',                                         price: 100  },
  { id: '54', name: 'LTS',                                         price: 3500 },
  { id: '55', name: 'Reading Type 1',                              price: 500  },
  { id: '56', name: 'Reading Type 2',                              price: 600  },
  { id: '57', name: 'Reading Type 3',                              price: 700  },
  { id: '58', name: 'Reading by frame ±0.5-3',                     price: 1400 },
  { id: '59', name: 'Reading by frame ± >4',                       price: 1500 },
  { id: '60', name: 'ARC',                                         price: 1900 },
  { id: '61', name: 'Photo solar',                                  price: 1900 },
  { id: '62', name: 'Bifocal',                                     price: 2300 },
  { id: '63', name: 'Distance ±1-4',                               price: 2300 },
  { id: '64', name: 'Distance 7-20',                               price: 2700 },
  { id: '65', name: 'Progressive',                                  price: 2500 },
  { id: '66', name: 'Cylinder ±<4',                                price: 3600 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: BillingLineItem[], total: number) => void;
  initialItems?: BillingLineItem[];
}

export const BillingModal: React.FC<Props> = ({ open, onClose, onConfirm, initialItems = [] }) => {
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<BillingLineItem[]>(initialItems);
  const [defaultPrices, setDefaultPrices] = useState<Record<string, number>>({});

  // Re-sync when modal opens with existing items
  React.useEffect(() => {
    if (open) setSelected(initialItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  // custom item
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PRICE_LIST;
    return PRICE_LIST.filter((item) => item.name.toLowerCase().includes(q));
  }, [search]);

  const selectedIds = new Set(selected.map((s) => s.id));

  // Get effective price (user-edited default or original)
  const effectivePrice = (item: BillingItem) =>
    defaultPrices[item.id] !== undefined ? defaultPrices[item.id] : item.price;

  // Update the default price in the list (and sync if already selected)
  const updateDefaultPrice = (item: BillingItem, value: string) => {
    const num = parseFloat(value);
    const price = isNaN(num) ? 0 : num;
    setDefaultPrices((prev) => ({ ...prev, [item.id]: price }));
    // keep selected item in sync
    setSelected((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, price } : s))
    );
  };

  const toggleItem = (item: BillingItem) => {
    if (selectedIds.has(item.id)) {
      setSelected((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      setSelected((prev) => [...prev, { id: item.id, name: item.name, price: effectivePrice(item) }]);
    }
  };

  const updatePrice = (id: string, value: string) => {
    const num = parseFloat(value);
    setSelected((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: isNaN(num) ? 0 : num } : s))
    );
  };

  const removeItem = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const addCustomItem = () => {
    const name = customName.trim();
    const price = parseFloat(customPrice);
    if (!name) return;
    setSelected((prev) => [
      ...prev,
      { id: `custom-${generateId()}`, name, price: isNaN(price) ? 0 : price },
    ]);
    setCustomName('');
    setCustomPrice('');
  };

  const total = selected.reduce((sum, item) => sum + item.price, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-[#1E3A8A]">Create Billing</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Search + inline item list */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Search & select items
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search by item name..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
            />
            {dropdownOpen && (
              <div className="mt-1 w-full bg-white border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-slate-400 px-3 py-3">No items found</p>
                ) : (
                  filtered.map((item) => {
                    const isChecked = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                          isChecked ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <span
                            className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-white text-[10px] font-bold transition-colors ${
                              isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                            }`}
                          >
                            {isChecked && '✓'}
                          </span>
                          <span className="text-xs text-slate-800 truncate">{item.name}</span>
                        </button>
                        <div className="flex items-center gap-1 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={effectivePrice(item)}
                            onChange={(e) => updateDefaultPrice(item, e.target.value)}
                            min={0}
                            className="w-20 px-2 py-0.5 text-xs border border-slate-300 rounded text-right focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-xs text-slate-400">ETB</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selected items with editable prices */}
          {selected.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Selected items
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selected.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <span className="flex-1 text-xs text-slate-800 truncate">{item.name}</span>
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
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom item */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Add custom item (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Item name"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
              />
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Price"
                min={0}
                className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
              />
              <button
                type="button"
                onClick={addCustomItem}
                disabled={!customName.trim()}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="text-sm font-bold text-slate-800">
            Total:{' '}
            <span className="text-teal-600">{total.toLocaleString()} ETB</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(selected, total); onClose(); }}
              disabled={selected.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Billing and send to receptionist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
