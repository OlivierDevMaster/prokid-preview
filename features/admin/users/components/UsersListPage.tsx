'use client';

import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, MoreVertical, Search, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/features/paginations/components/Pagination';
import { useRouter } from '@/i18n/routing';

import type { AdminProfile, AdminUsersFilters } from '../users.service';

import { useAdminUsers } from '../hooks/useAdminUsers';

const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 10;

function getRoleBadge(role: string) {
  switch (role) {
    case 'professional':
      return (
        <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
          Professionnel
        </Badge>
      );
    case 'structure':
      return (
        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
          Structure
        </Badge>
      );
    case 'admin':
      return (
        <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
          Admin
        </Badge>
      );
    default:
      return <Badge variant='secondary'>{role}</Badge>;
  }
}

function getOnboardedBadge(isOnboarded: boolean) {
  return isOnboarded ? (
    <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
      Inscrit
    </Badge>
  ) : (
    <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
      En attente
    </Badge>
  );
}

export function UsersListPage() {
  const router = useRouter();

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(PAGE_SIZE_DEFAULT)
  );
  const [search, setSearch] = useQueryState('search', parseAsString);
  const [roleFilter, setRoleFilter] = useQueryState(
    'role',
    parseAsString.withDefault('all')
  );

  const filters: AdminUsersFilters = {
    role: (roleFilter as AdminUsersFilters['role']) || 'all',
    search: search || undefined,
  };

  const { data, isLoading } = useAdminUsers(filters, {
    limit: pageSize,
    page,
  });

  const users = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value || null);
    setPage(PAGE_DEFAULT);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value === 'all' ? null : value);
    setPage(PAGE_DEFAULT);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const columns: ColumnDef<AdminProfile>[] = [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const firstName = row.original.first_name;
        const lastName = row.original.last_name;
        const fullName =
          `${firstName || ''} ${lastName || ''}`.trim() || 'Sans nom';
        return <div className='font-medium'>{fullName}</div>;
      },
      header: 'Nom',
    },
    {
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className='text-gray-600'>{row.original.email}</div>
      ),
      header: 'Email',
    },
    {
      accessorKey: 'role',
      cell: ({ row }) => getRoleBadge(row.original.role),
      header: 'Role',
    },
    {
      accessorKey: 'is_onboarded',
      cell: ({ row }) => getOnboardedBadge(row.original.is_onboarded),
      header: 'Statut',
    },
    {
      accessorKey: 'invitation_status',
      cell: ({ row }) => {
        const status = row.original.invitation_status;
        if (!status || status === 'none') return <span className='text-gray-400'>-</span>;
        switch (status) {
          case 'pending':
            return (
              <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
                En attente
              </Badge>
            );
          case 'accepted':
            return (
              <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                Acceptee
              </Badge>
            );
          case 'declined':
            return (
              <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                Refusee
              </Badge>
            );
          default:
            return <Badge variant='secondary'>{status}</Badge>;
        }
      },
      header: 'Invitation',
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = row.original.created_at;
        return (
          <div className='text-gray-600'>
            {format(new Date(date), 'dd MMM yyyy', { locale: fr })}
          </div>
        );
      },
      header: 'Date de creation',
    },
    {
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='h-8 w-8' size='icon' variant='ghost'>
                  <MoreVertical className='h-4 w-4' />
                  <span className='sr-only'>Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => handleViewUser(user.user_id)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  Voir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      header: '',
      id: 'actions',
    },
  ];

  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Chargement...</p>;
  }

  return (
    <div className='mb-36 space-y-4 md:mb-0'>
      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              className='px-10'
              onChange={e => handleSearchChange(e.target.value)}
              placeholder='Rechercher par nom ou email...'
              value={search || ''}
            />
            {search && (
              <Button
                className='absolute right-0 top-1/2 -translate-y-1/2'
                onClick={() => handleSearchChange('')}
                variant='ghost'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          <Select
            onValueChange={handleRoleChange}
            value={roleFilter || 'all'}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Filtrer par role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tous les roles</SelectItem>
              <SelectItem value='professional'>Professionnel</SelectItem>
              <SelectItem value='structure'>Structure</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
            </SelectContent>
          </Select>

          {(search || (roleFilter && roleFilter !== 'all')) && (
            <div className='flex items-center'>
              <Button
                onClick={() => {
                  handleSearchChange('');
                  setRoleFilter(null);
                }}
                variant='outline'
              >
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <p className='py-8 text-center text-gray-500'>
          Aucun utilisateur trouve.
        </p>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-md border bg-white'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      className='cursor-pointer hover:bg-gray-50'
                      key={row.id}
                      onClick={() =>
                        handleViewUser(row.original.user_id)
                      }
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className='h-24 text-center'
                      colSpan={columns.length}
                    >
                      Aucun resultat.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}
