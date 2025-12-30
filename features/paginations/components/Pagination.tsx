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

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    onPageSizeChange?.(newPageSize);
    onPageChange(1);
  };

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2'>
        {onPageSizeChange && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {t('itemsPerPage')}:
            </span>
            <Select
              onValueChange={handlePageSizeChange}
              value={String(pageSize)}
            >
              <SelectTrigger className='h-8 w-[70px]'>
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
          </div>
        )}
        <div className='hidden text-sm text-muted-foreground md:block'>
          {t('showing')} {startItem} {t('to')} {endItem} {t('ofItems')}{' '}
          {totalItems}
        </div>
        <div className='text-sm text-muted-foreground md:hidden'>
          {t('showing')} {startItem} / {endItem} {totalItems}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          size='sm'
          variant='outline'
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          {t('previous')}
        </Button>
        <div className='text-sm text-muted-foreground'>
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size='sm'
          variant='outline'
        >
          {t('next')}
          <ChevronRight className='ml-1 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
