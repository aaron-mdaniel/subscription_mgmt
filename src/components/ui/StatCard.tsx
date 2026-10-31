import React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  let borderLeft = 'border-l-indigo-600';
  if (variant === 'success') borderLeft = 'border-l-emerald-600';
  if (variant === 'warning') borderLeft = 'border-l-amber-600';
  if (variant === 'danger') borderLeft = 'border-l-red-600';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${borderLeft} p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};
