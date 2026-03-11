'use client';

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

export interface UseScrollToBottomResult {
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  scrollToBottom: (behavior: ScrollBehavior) => void;
}

export function useScrollToBottom(
  conversationId: string | undefined,
  isLoadingMessages: boolean,
  messageCount: number
): UseScrollToBottomResult {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<null | number>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    if (scrollRafRef.current != null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!conversationId) return;
    if (isLoadingMessages) return;
    scrollToBottom('auto');
  }, [conversationId, isLoadingMessages, scrollToBottom]);

  useLayoutEffect(() => {
    if (!conversationId) return;
    if (isLoadingMessages) return;
    scrollToBottom('smooth');
  }, [conversationId, isLoadingMessages, messageCount, scrollToBottom]);

  return {
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
  };
}
