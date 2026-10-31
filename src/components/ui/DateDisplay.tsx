import React from 'react';

interface DateDisplayProps {
  date: string | null | undefined;
  includeTime?: boolean;
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  includeTime = false,
  className = '',
}) => {
  if (!date) return <span className="text-slate-400">—</span>;

  try {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = includeTime
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

    return <span className={`text-slate-700 ${className}`}>{d.toLocaleDateString('en-US', options)}</span>;
  } catch {
    return <span className={className}>{date}</span>;
  }
};
