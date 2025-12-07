import { Button } from '@/components/ui/button';

type TableHeaderActionsProps = {
  actions: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }[];
};

export default function TableHeaderActions({
  actions,
}: TableHeaderActionsProps) {
  return (
    <div className='flex w-full justify-end'>
      {actions.map(action => (
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          key={action.label}
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
