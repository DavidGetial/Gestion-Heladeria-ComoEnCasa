import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'pink' | 'mint' | 'amber';
  subtitle?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
  mint: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
};

export function StatsCard({ title, value, icon: Icon, color = 'blue', subtitle }: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <div className={`${config.bg} rounded-2xl p-6 border-2 border-transparent`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${config.iconBg} w-12 h-12 rounded-xl flex items-center justify-center ${config.text}`}>
          <Icon size={24} />
        </div>
      </div>
      <h3 className="text-sm text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}
