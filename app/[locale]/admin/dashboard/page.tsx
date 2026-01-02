'use client';

import {
  Award,
  Building2,
  CheckCircle,
  CircleCheck,
  Clock,
  FileCheck,
  MessageSquare,
  Percent,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDashboardStats } from '@/features/admin/hooks/useGetDashboardStats';
import { StatCard } from '@/features/admin/StatCard';

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');

  const {
    activeMissionsCount,
    activeProfessionalsCount,
    activeStructuresCount,
    averageMissionsPerStructure,
    averageProfessionalsPerStructure,
    completedMissionsCount,
    missionCompletionRate,
    missionsCount,
    mostActiveProfessional,
    mostActiveStructure,
    pendingInvitationsCount,
    pendingMissionsCount,
    professionalsCount,
    structuresCount,
    systemGrowthRate,
    totalInvitationsCount,
    totalReportsCount,
  } = useGetDashboardStats();

  return (
    <div className='min-h-screen space-y-4 overflow-hidden bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Cards - Main KPIs */}
      <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3'>
        <StatCard
          icon={Users}
          title={t('totalProfessionals')}
          value={professionalsCount.toString()}
        />
        <StatCard
          icon={Building2}
          title={t('totalStructures')}
          value={structuresCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
      </div>

      {/* User Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('userStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            description={t('activeProfessionalsDescription')}
            icon={UserCheck}
            subtitle={
              professionalsCount > 0
                ? `${activeProfessionalsCount}/${professionalsCount} (${Math.round((activeProfessionalsCount / professionalsCount) * 100)}%)`
                : undefined
            }
            title={t('activeProfessionals')}
            value={activeProfessionalsCount.toString()}
          />
          <StatCard
            description={t('activeStructuresDescription')}
            icon={Building2}
            subtitle={
              structuresCount > 0
                ? `${activeStructuresCount}/${structuresCount} (${Math.round((activeStructuresCount / structuresCount) * 100)}%)`
                : undefined
            }
            title={t('activeStructures')}
            value={activeStructuresCount.toString()}
          />
        </div>
      </div>

      {/* Mission Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('missionStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            icon={Clock}
            title={t('pendingMissions')}
            value={pendingMissionsCount.toString()}
          />
          <StatCard
            icon={CheckCircle}
            title={t('activeMissions')}
            value={activeMissionsCount.toString()}
          />
          <StatCard
            icon={CircleCheck}
            title={t('completedMissions')}
            value={completedMissionsCount.toString()}
          />
        </div>
      </div>

      {/* Invitations */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('invitations')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            icon={UserPlus}
            title={t('pendingInvitations')}
            value={pendingInvitationsCount.toString()}
          />
          <StatCard
            icon={UserCheck}
            title={t('totalInvitations')}
            value={totalInvitationsCount.toString()}
          />
        </div>
      </div>

      {/* Reports */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('reports')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-1'>
          <StatCard
            icon={FileCheck}
            title={t('totalReports')}
            value={totalReportsCount.toString()}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('performanceMetrics')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            icon={Percent}
            subtitle={t('missionCompletionRateDescription')}
            title={t('missionCompletionRate')}
            value={`${missionCompletionRate}%`}
          />
          <StatCard
            icon={TrendingUp}
            subtitle={t('systemGrowthRateDescription')}
            title={t('systemGrowthRate')}
            value={systemGrowthRate.toString()}
          />
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('analytics')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            icon={MessageSquare}
            subtitle={t('averageMissionsPerStructureDescription')}
            title={t('averageMissionsPerStructure')}
            value={averageMissionsPerStructure.toFixed(1)}
          />
          <StatCard
            icon={Users}
            subtitle={t('averageProfessionalsPerStructureDescription')}
            title={t('averageProfessionalsPerStructure')}
            value={averageProfessionalsPerStructure.toFixed(1)}
          />
        </div>
      </div>

      {/* Most Active */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('mostActive')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          {/* Most Active Structure */}
          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div className='flex-1'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  {t('mostActiveStructure')}
                </CardTitle>
                <p className='mt-1 text-xs text-gray-500'>
                  {t('mostActiveStructureDescription')}
                </p>
              </div>
              <Award className='h-5 w-5 text-green-600' />
            </CardHeader>
            <CardContent>
              {mostActiveStructure ? (
                <div className='flex items-center gap-4'>
                  {/* Profile Image */}
                  <div className='relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                    {mostActiveStructure.avatarUrl ? (
                      <Image
                        alt={mostActiveStructure.structureName}
                        className='h-full w-full object-cover'
                        height={64}
                        src={mostActiveStructure.avatarUrl}
                        unoptimized
                        width={64}
                      />
                    ) : (
                      <span className='text-lg font-semibold text-gray-600'>
                        {mostActiveStructure.structureName
                          .split(' ')
                          .map(n => n.charAt(0))
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='text-3xl font-bold text-gray-900'>
                      {mostActiveStructure.missionCount}
                    </div>
                    <Link
                      className='mt-1 block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      href={`/admin/structures/${mostActiveStructure.userId}`}
                    >
                      {mostActiveStructure.structureName}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='text-3xl font-bold text-gray-900'>0</div>
              )}
            </CardContent>
          </Card>

          {/* Most Active Professional */}
          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div className='flex-1'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  {t('mostActiveProfessional')}
                </CardTitle>
                <p className='mt-1 text-xs text-gray-500'>
                  {t('mostActiveProfessionalDescription')}
                </p>
              </div>
              <Award className='h-5 w-5 text-green-600' />
            </CardHeader>
            <CardContent>
              {mostActiveProfessional ? (
                <div className='flex items-center gap-4'>
                  {/* Profile Image */}
                  <div className='relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                    {mostActiveProfessional.avatarUrl ? (
                      <Image
                        alt={mostActiveProfessional.professionalName}
                        className='h-full w-full object-cover'
                        height={64}
                        src={mostActiveProfessional.avatarUrl}
                        unoptimized
                        width={64}
                      />
                    ) : (
                      <span className='text-lg font-semibold text-gray-600'>
                        {mostActiveProfessional.professionalName
                          .split(' ')
                          .map(n => n.charAt(0))
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='text-3xl font-bold text-gray-900'>
                      {mostActiveProfessional.missionCount}
                    </div>
                    <Link
                      className='mt-1 block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
                      href={`/admin/professionals/${mostActiveProfessional.userId}`}
                    >
                      {mostActiveProfessional.professionalName}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='text-3xl font-bold text-gray-900'>0</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
