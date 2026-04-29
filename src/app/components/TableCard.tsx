import { Table, TableStatus } from '../data/mockData';
import { Users, Clock } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onClick?: () => void;
}

const statusConfig: Record<TableStatus, { bg: string; border: string; text: string; label: string; icon: string }> = {
  empty: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    label: 'Disponible',
    icon: '🔵',
  },
  occupied: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    label: 'Ocupada',
    icon: '🟡',
  },
  'ready-to-pay': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    label: 'Listo para cobrar',
    icon: '🟢',
  },
};

export function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={onClick}
      className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-105 active:scale-100 text-left w-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-12 h-12 rounded-xl ${config.text} bg-white border-2 ${config.border} flex items-center justify-center`}>
            <span className="text-xl font-bold">{table.number}</span>
          </div>
        </div>
        <span className={`${config.text} text-xs font-semibold px-2 py-1 rounded-full bg-white`}>
          {config.label}
        </span>
      </div>

      {table.status !== 'empty' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} />
            <span>{table.guests} personas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={16} />
            <span>{table.openedAt}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 mt-3">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-bold text-slate-900">
              ${table.total?.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      )}

      {table.status === 'empty' && (
        <p className="text-sm text-slate-400 mt-2">Click para abrir mesa</p>
      )}
    </button>
  );
}