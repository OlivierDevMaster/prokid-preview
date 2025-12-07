import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  className?: string;
  icon: LucideIcon;
  title: string;
  value: number | string;
}

export function StatCard({
  className,
  icon: Icon,
  title,
  value,
}: StatCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600'>
          {title}
        </CardTitle>
        <Icon className='h-5 w-5 text-green-600' />
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold text-gray-900'>{value}</div>
      </CardContent>
    </Card>
  );
}
