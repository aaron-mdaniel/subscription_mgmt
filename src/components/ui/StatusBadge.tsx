import React from 'react';

interface StatusBadgeProps {
  status: string;
  isOverdue?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOverdue = false }) => {
  const norm = status?.toLowerCase() || '';

  if (isOverdue) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Overdue
      </span>
    );
  }

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';

  switch (norm) {
    case 'paid':
    case 'active':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'confirmed':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'draft':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'cancelled':
    case 'closed':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'quotation':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
  }

  const label = norm.charAt(0).toUpperCase() + norm.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      {label}
    </span>
  );
};
