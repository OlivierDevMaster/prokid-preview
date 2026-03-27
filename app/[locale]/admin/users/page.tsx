import { UsersListPage } from '@/features/admin/users/components/UsersListPage';

export default function UsersPage() {
  return (
    <div className='space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Utilisateurs
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          Gerez tous les utilisateurs de la plateforme
        </p>
      </div>

      {/* Table */}
      <div className='min-w-0 overflow-x-auto'>
        <UsersListPage />
      </div>
    </div>
  );
}
