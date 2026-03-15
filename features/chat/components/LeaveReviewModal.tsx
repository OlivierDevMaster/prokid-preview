'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

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

export interface LeaveReviewModalExistingRating {
  comment: null | string;
  id: string;
  rating: number;
}

export interface LeaveReviewModalProps {
  existingRating?: LeaveReviewModalExistingRating | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onRemove?: (ratingId: string) => void;
  onSubmit: (rating: number, comment: string) => void;
  revieweeName: string;
}

export function LeaveReviewModal({
  existingRating = null,
  isOpen,
  isSubmitting = false,
  onClose,
  onRemove,
  onSubmit,
  revieweeName,
}: LeaveReviewModalProps) {
  const t = useTranslations('chat');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (existingRating) {
        setRating(existingRating.rating);
        setComment(existingRating.comment ?? '');
      } else {
        setRating(0);
        setComment('');
      }
    }
  }, [isOpen, existingRating]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      if (existingRating) {
        setRating(existingRating.rating);
        setComment(existingRating.comment ?? '');
      } else {
        setRating(0);
        setComment('');
      }
      setHoveredRating(0);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  const handleRemove = () => {
    if (!existingRating || !onRemove) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(t('removeReviewConfirm'))
    )
      return;
    onRemove(existingRating.id);
  };

  const isEditMode = !!existingRating;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t('updateReviewTitle', { name: revieweeName })
              : t('leaveReviewTitle', { name: revieweeName })}
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

        <DialogFooter className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          {isEditMode && onRemove && (
            <Button
              className='border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:mr-auto'
              disabled={isSubmitting}
              onClick={handleRemove}
              variant='outline'
            >
              {t('removeReview')}
            </Button>
          )}
          <div className='flex flex-row justify-end gap-2'>
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
              {isSubmitting
                ? t('leaveReviewSubmitting')
                : isEditMode
                  ? t('updateReviewSubmit')
                  : t('leaveReviewSubmit')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
