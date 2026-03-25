'use client';

import { Eye, Loader2 } from 'lucide-react';

import {
  type ProfileViewStats,
  useProfileViewStats,
} from '@/features/professional/stats/hooks/useProfileViewStats';

function calculateTrend(
  current: number,
  previous: number
): { label: string; color: string } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { label: `+${current}`, color: 'text-emerald-600' };

  const change = Math.round(((current - previous) / previous) * 100);

  if (change > 0) {
    return { label: `\u2191 +${change}%`, color: 'text-emerald-600' };
  } else if (change < 0) {
    return { label: `\u2193 ${change}%`, color: 'text-red-500' };
  }
  return { label: '= 0%', color: 'text-slate-400' };
}

function StatBox({
  label,
  value,
  trend,
  trendLabel,
  isLoading,
}: {
  label: string;
  value: number;
  trend: { label: string; color: string } | null;
  trendLabel: string;
  isLoading: boolean;
}) {
  return (
    <div className='flex flex-1 flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-4'>
      <span className='text-xs font-medium text-slate-500'>{label}</span>
      {isLoading ? (
        <Loader2 className='mt-1 h-5 w-5 animate-spin text-slate-400' />
      ) : (
        <>
          <span className='text-2xl font-bold text-slate-900'>{value}</span>
          {trend ? (
            <span className={`text-xs font-medium ${trend.color}`}>
              {trend.label}
              <span className='ml-1 text-slate-400'>{trendLabel}</span>
            </span>
          ) : (
            <span className='text-xs text-slate-400'>{trendLabel}</span>
          )}
        </>
      )}
    </div>
  );
}

export function ProfileViewsStats() {
  const { data: stats, isLoading } = useProfileViewStats();

  const todayTrend = stats
    ? calculateTrend(stats.today, stats.yesterday)
    : null;
  const weekTrend = stats
    ? calculateTrend(stats.this_week, stats.last_week)
    : null;
  const monthTrend = stats
    ? calculateTrend(stats.this_month, stats.last_month)
    : null;

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Eye className='h-4 w-4 text-blue-600' />
          <h3 className='text-sm font-semibold text-slate-900'>
            Vues du profil
          </h3>
        </div>
        <span className='text-xs font-medium text-slate-500'>
          Total :{' '}
          {isLoading ? (
            <Loader2 className='inline h-3 w-3 animate-spin' />
          ) : (
            <span className='font-semibold text-slate-900'>
              {stats?.total ?? 0}
            </span>
          )}
        </span>
      </div>

      <div className='flex gap-3'>
        <StatBox
          isLoading={isLoading}
          label="Aujourd'hui"
          trend={todayTrend}
          trendLabel='vs hier'
          value={stats?.today ?? 0}
        />
        <StatBox
          isLoading={isLoading}
          label='Cette semaine'
          trend={weekTrend}
          trendLabel='vs sem. dern.'
          value={stats?.this_week ?? 0}
        />
        <StatBox
          isLoading={isLoading}
          label='Ce mois'
          trend={monthTrend}
          trendLabel='vs mois dern.'
          value={stats?.this_month ?? 0}
        />
      </div>
    </div>
  );
}
