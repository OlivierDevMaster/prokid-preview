import { MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { TableActionType } from '../models/table.modele';

type TableActionsProps = {
  actions: TableActionType[];
};

export default function TableActions({ actions }: TableActionsProps) {
  return (
    <div className='flex justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='h-8 w-8' size='icon' variant='ghost'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {actions.map(action => (
            <DropdownMenuItem
              className='cursor-pointer'
              key={action.label}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
