import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorClass?: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'amber' | 'cyan' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold text-foreground tracking-tight tabular-nums">{value}</div>
        {badgeText && (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-border bg-muted text-muted-foreground">
            {badgeText}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
};
