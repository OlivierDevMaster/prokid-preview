'use client';

import { ChatView } from '@/features/chat/components/ChatView';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';
import { useEffect } from 'react';

export default function StructureChatPage() {
  const { handleClearSelection } = useSelectedProfessional();
  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);
  return <ChatView viewRole='structure' />;
}
