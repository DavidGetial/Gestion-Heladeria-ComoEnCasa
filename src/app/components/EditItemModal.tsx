import { useState } from 'react';
import { X } from 'lucide-react';
import { OrderItem, mockToppings } from '../data/mockData';

interface EditItemModalProps {
  item: OrderItem;
  onClose: () => void;
  onSave: (updatedItem: OrderItem) => void;
}

export function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  const [size, setSize] = useState<'pequeño' | 'mediano' | 'grande'>(item.size);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(item.toppings);
  const [notes, setNotes] = useState(item.notes || '');

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev =>
      prev.includes(topping)
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  const handleSave = () => {
    onSave({
      ...item,
      size,
      toppings: selectedToppings,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Editar producto</h3>
            <p className="text-slate-600">{item.productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Size selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Tamaño
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['pequeño', 'mediano', 'grande'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                  size === s
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Toppings selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Toppings (opcional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mockToppings.map((topping) => (
              <button
                key={topping}
                onClick={() => toggleTopping(topping)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                  selectedToppings.includes(topping)
                    ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                    : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      selectedToppings.includes(topping)
                        ? 'bg-pink-500 border-pink-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedToppings.includes(topping) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                  <span>{topping}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Observaciones
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Sin azúcar, extra crema..."
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
