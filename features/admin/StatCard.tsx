import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  className?: string;
  description?: string;
  icon: LucideIcon;
  subtitle?: string;
  title: string;
  value: number | string;
}

export function StatCard({
  className,
  description,
  icon: Icon,
  subtitle,
  title,
  value,
}: StatCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex-1'>
          <CardTitle className='text-sm font-medium text-gray-600'>
            {title}
          </CardTitle>
          {description && (
            <p className='mt-1 text-xs text-gray-500'>{description}</p>
          )}
        </div>
        <Icon className='h-5 w-5 text-green-600' />
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold text-gray-900'>{value}</div>
        {subtitle && (
          <div className='mt-1 text-sm text-gray-600'>{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
