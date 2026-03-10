'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSize: number;
  pageSizeOptions?: number[];
  totalItems: number;
  totalPages: number;
}

export function Pagination({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  totalPages,
}: PaginationProps) {
  const t = useTranslations('common.pagination');

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    onPageSizeChange?.(newPageSize);
    onPageChange(1);
  };

  return (
    <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        {onPageSizeChange && (
          <>
            <span>{t('itemsPerPage')}:</span>
            <Select
              onValueChange={handlePageSizeChange}
              value={String(pageSize)}
            >
              <SelectTrigger className='h-8 w-[70px] rounded-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        <span className='hidden md:inline'>
          {t('showing')} {startItem} {t('to')} {endItem} {t('ofItems')}{' '}
          {totalItems}
        </span>
        <span className='md:hidden'>
          {t('showing')} {startItem} / {endItem} {totalItems}
        </span>
      </div>

      <div className='flex items-center gap-3'>
        <Button
          aria-label={t('previous')}
          className='h-9 w-9 rounded-full'
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          size='icon'
          variant='outline'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='flex items-center gap-2'>
          {pages.map(pageNumber => (
            <Button
              className={`h-9 w-9 rounded-full text-sm ${
                pageNumber === currentPage
                  ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              size='icon'
              variant={pageNumber === currentPage ? 'default' : 'outline'}
            >
              {pageNumber}
            </Button>
          ))}
        </div>

        <Button
          aria-label={t('next')}
          className='h-9 w-9 rounded-full'
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size='icon'
          variant='outline'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
