'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading,
  className = '',
}: StatsCardProps) {
  const changeColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          )}
          {change && !loading && (
            <p className={`mt-1 text-xs font-medium ${changeColor[changeType]}`}>{change}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C0B5D]/10 text-[#0C0B5D]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
