'use client';

import {
  Building2,
  CalendarCheck,
  FileText,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useGetDashboardStats } from '@/features/admin/hooks/useGetDashboardStats';

export default function DashboardPage() {
  const {
    activeMissionsCount,
    completedMissionsCount,
    missionCompletionRate,
    missionsCount,
    pendingMissionsCount,
    professionalsCount,
    structuresCount,
    systemGrowthRate,
    totalReportsCount,
  } = useGetDashboardStats();

  return (
    <div className='min-h-screen bg-white p-6 lg:p-10'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-slate-900'>Tableau de bord</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Vue d'ensemble de la plateforme ProKid
          </p>
        </div>

        {/* Main KPIs */}
        <div className='mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <KpiCard
            href='/admin/professionals'
            icon={Users}
            label='Professionnels'
            value={professionalsCount}
          />
          <KpiCard
            href='/admin/structures'
            icon={Building2}
            label='Structures'
            value={structuresCount}
          />
          <KpiCard
            href='/admin/missions'
            icon={CalendarCheck}
            label='Missions'
            value={missionsCount}
          />
          <KpiCard
            icon={FileText}
            label='Rapports'
            value={totalReportsCount}
          />
        </div>

        {/* Detailed stats */}
        <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Missions breakdown */}
          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold text-slate-900'>Missions</h2>
            <div className='space-y-3'>
              <StatRow color='bg-amber-500' label='En attente' value={pendingMissionsCount} />
              <StatRow color='bg-blue-500' label='En cours' value={activeMissionsCount} />
              <StatRow color='bg-emerald-500' label='Terminées' value={completedMissionsCount} />
            </div>
            <div className='mt-4 border-t border-slate-100 pt-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-500'>Taux de complétion</span>
                <span className='font-bold text-slate-900'>{missionCompletionRate}%</span>
              </div>
            </div>
          </div>

          {/* Users breakdown */}
          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold text-slate-900'>Utilisateurs</h2>
            <div className='space-y-3'>
              <StatRow color='bg-blue-500' label='Professionnels' value={professionalsCount} />
              <StatRow color='bg-emerald-500' label='Structures' value={structuresCount} />
            </div>
            <p className='mt-4 text-xs text-slate-400'>
              Tous les comptes créés sur la plateforme (onboarding complété ou non).
            </p>
          </div>

          {/* Growth */}
          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold text-slate-900'>Lancement</h2>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100'>
                  <TrendingUp className='h-5 w-5 text-emerald-600' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>+{systemGrowthRate}</p>
                  <p className='text-xs text-slate-500'>Nouveaux pros inscrits ce mois</p>
                </div>
              </div>
              <div className='border-t border-slate-100 pt-3'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-slate-500'>Rapports rédigés</span>
                    <span className='font-bold text-slate-900'>{totalReportsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-bold text-slate-900'>Actions rapides</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <Link
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50'
              href='/admin/invite'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100'>
                <UserPlus className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Inviter un pro</p>
                <p className='text-xs text-slate-500'>Pré-inscrire un professionnel</p>
              </div>
            </Link>
            <Link
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50'
              href='/admin/tags'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100'>
                <CalendarCheck className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Gérer les tags</p>
                <p className='text-xs text-slate-500'>Compétences et diplômes</p>
              </div>
            </Link>
            <Link
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50'
              href='/admin/users'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100'>
                <Users className='h-5 w-5 text-emerald-600' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Utilisateurs</p>
                <p className='text-xs text-slate-500'>Gérer tous les comptes</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  const content = (
    <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-slate-500'>{label}</p>
          <p className='mt-1 text-3xl font-bold text-slate-900'>{value}</p>
        </div>
        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50'>
          <Icon className='h-6 w-6 text-blue-600' />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function StatRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className='text-sm text-slate-600'>{label}</span>
      </div>
      <span className='text-lg font-bold text-slate-900'>{value}</span>
    </div>
  );
}
