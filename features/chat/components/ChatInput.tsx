'use client';

import { CalendarPlus, FileText, Plus, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

import type { ViewRole } from '../types/chat.types';

const MIN_TEXTAREA_HEIGHT = 44;
const MAX_TEXTAREA_HEIGHT_PX = 18 * 16; // 18rem

export interface ChatInputProps {
  isSending: boolean;
  onProposeAppointment: () => void;
  onSend: (content: string) => void;
  scrollToEndRef: React.RefObject<HTMLDivElement | null>;
  viewRole: ViewRole;
}

export function ChatInput({
  isSending,
  onProposeAppointment,
  onSend,
  scrollToEndRef,
  viewRole,
}: ChatInputProps) {
  const t = useTranslations('chat');
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(MIN_TEXTAREA_HEIGHT, Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX))}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  const handleSend = useCallback(() => {
    const content = draft.trim();
    if (!content || isSending) return;
    onSend(content);
    setDraft('');
    setTimeout(() => {
      scrollToEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [draft, isSending, onSend, scrollToEndRef]);

  return (
    <div className='flex items-end justify-center gap-2 border-t p-3'>
      <div className='flex h-full items-center justify-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label={t('attach')} size='icon' variant='ghost'>
              <Plus className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start'>
            {viewRole === 'professional' && (
              <DropdownMenuItem onClick={onProposeAppointment}>
                <CalendarPlus className='mr-2 h-4 w-4' />
                {t('proposeMeeting')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <FileText className='mr-2 h-4 w-4' />
              {t('writeReport')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Textarea
        className='max-h-[18rem] min-h-[44px] resize-none rounded-md border-none bg-[#f1f5f9] px-4'
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={t('writeMessagePlaceholder')}
        ref={textareaRef}
        rows={1}
        value={draft}
      />
      <Button
        aria-label={t('send')}
        className='h-11 w-11 shrink-0 rounded-full'
        disabled={!draft.trim() || isSending}
        onClick={handleSend}
        size='icon'
      >
        <Send className='h-5 w-5' />
      </Button>
    </div>
  );
}
