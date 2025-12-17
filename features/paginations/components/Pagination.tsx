'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  translations?: {
    itemsPerPage?: string;
    next?: string;
    of?: string;
    ofItems?: string;
    page?: string;
    previous?: string;
    showing?: string;
    to?: string;
  };
}

export function Pagination({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  totalPages,
  translations = {},
}: PaginationProps) {
  const {
    itemsPerPage = 'Items per page',
    next = 'Next',
    of = 'of',
    ofItems = 'of',
    page = 'Page',
    previous = 'Previous',
    showing = 'Showing',
    to = 'to',
  } = translations;

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
              {itemsPerPage}:
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
        <div className='text-sm text-muted-foreground'>
          {showing} {startItem} {to} {endItem} {ofItems} {totalItems}
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
          {previous}
        </Button>
        <div className='text-sm text-muted-foreground'>
          {page} {currentPage} {of} {totalPages}
        </div>
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size='sm'
          variant='outline'
        >
          {next}
          <ChevronRight className='ml-1 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
