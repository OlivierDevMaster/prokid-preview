'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RatingModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function RatingModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const t = useTranslations('structure.ratings');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = () => {
    if (rating === 0) {
      return;
    }
    onSubmit(rating, comment);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{t('rateProfessional')}</DialogTitle>
          <DialogDescription>
            {t('rateProfessionalDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <div className='mb-6'>
            <Label className='mb-2 block text-sm font-medium'>
              {t('rating')}
            </Label>
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  className='focus:outline-none'
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  type='button'
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && (
              <p className='mt-2 text-sm text-red-500'>{t('ratingRequired')}</p>
            )}
          </div>

          <div className='mb-4'>
            <Label className='mb-2 block text-sm font-medium' htmlFor='comment'>
              {t('comment')} ({t('optional')})
            </Label>
            <Textarea
              className='min-h-[100px]'
              id='comment'
              onChange={e => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              value={comment}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            variant='outline'
          >
            {t('cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={isSubmitting || rating === 0}
            onClick={handleSubmit}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
