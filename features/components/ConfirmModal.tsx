import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ConfirmModalProps = {
  cancelButtonText: string;
  confirmButtonText: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  type: 'delete' | 'stopRecurrence' | null;
};

export default function ConfirmModal(props: ConfirmModalProps) {
  const {
    cancelButtonText,
    confirmButtonText,
    description,
    onCancel,
    onConfirm,
    onOpenChange,
    open,
    title,
    type,
  } = props;
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onCancel} variant='outline'>
            {cancelButtonText}
          </Button>
          <Button
            className={
              type === 'delete'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            onClick={onConfirm}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
