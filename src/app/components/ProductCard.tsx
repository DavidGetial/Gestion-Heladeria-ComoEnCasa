import { Product } from '../data/mockData';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const hasMultipleSizes = Object.keys(product.price).length > 1;
  const firstPrice = Object.values(product.price)[0];

  return (
    <button
      onClick={() => onAdd?.(product)}
      className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 capitalize">{product.category}</p>
        </div>
        {product.popular && (
          <span className="text-xs bg-gradient-to-r from-pink-100 to-pink-200 text-pink-600 px-2 py-1 rounded-full font-medium">
            Popular
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">
            ${firstPrice.toLocaleString('es-CO')}
          </p>
          {hasMultipleSizes && (
            <p className="text-xs text-slate-500">Desde</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">
          <Plus size={18} />
        </div>
      </div>
    </button>
  );
}
