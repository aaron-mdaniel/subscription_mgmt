import React from 'react';

interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  currency = '$',
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return (
    <span className={`font-mono font-medium ${className}`}>
      {currency}{formatted}
    </span>
  );
};
