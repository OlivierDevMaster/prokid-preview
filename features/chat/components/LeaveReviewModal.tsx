'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface LeaveReviewModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  revieweeName: string;
}

export function LeaveReviewModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  revieweeName,
}: LeaveReviewModalProps) {
  const t = useTranslations('chat');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onClose();
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {t('leaveReviewTitle', { name: revieweeName })}
          </DialogTitle>
        </DialogHeader>

        <div className='py-2'>
          <p className='mb-3 text-sm text-foreground'>
            {t('leaveReviewRatingQuestion')}
          </p>
          <div className='mb-6 flex gap-2'>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
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

          <div>
            <Label
              className='mb-2 block text-sm font-medium'
              htmlFor='review-comment'
            >
              {t('leaveReviewCommentLabel')}
            </Label>
            <Textarea
              className='min-h-[100px]'
              id='review-comment'
              onChange={e => setComment(e.target.value)}
              placeholder={t('leaveReviewCommentPlaceholder', {
                name: revieweeName,
              })}
              value={comment}
            />
          </div>
        </div>

        <DialogFooter className='flex-row justify-end gap-2 sm:justify-end'>
          <Button
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            variant='ghost'
          >
            {t('leaveReviewCancel')}
          </Button>
          <Button
            className='bg-primary text-primary-foreground hover:bg-primary/90'
            disabled={isSubmitting || rating === 0}
            onClick={handleSubmit}
          >
            {isSubmitting ? t('leaveReviewSubmitting') : t('leaveReviewSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
