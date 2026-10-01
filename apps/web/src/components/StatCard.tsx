import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'amber' | 'cyan' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  badgeText,
  badgeColor = 'cyan',
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30';
      case 'amber':
        return 'bg-brand-amber/10 text-brand-amber border-brand-amber/30';
      case 'indigo':
        return 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/30';
      default:
        return 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30';
    }
  };

  return (
    <div className="stitch-card stitch-card-hover rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colorClass} transition group-hover:scale-105 duration-200`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="font-headline text-3xl font-bold text-white tracking-tight">{value}</div>
        {badgeText && (
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
};
