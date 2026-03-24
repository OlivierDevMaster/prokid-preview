import { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../../../types/database/schema.ts';

type Actor = 'professional' | 'structure';

type MissionRow = Database['public']['Tables']['missions']['Row'];

type MissionStatusForSystemMessage = Extract<
  Database['public']['Enums']['mission_status'],
  'accepted' | 'cancelled' | 'declined'
>;

export async function createMissionSystemMessage(options: {
  actor: Actor;
  mission: MissionRow;
  status: MissionStatusForSystemMessage;
  supabaseAdminClient: SupabaseClient<Database>;
}) {
  const { actor, mission, status, supabaseAdminClient } = options;

  const { data: existingConversation, error: existingConversationError } =
    await supabaseAdminClient
      .from('conversations')
      .select('id')
      .eq('structure_id', mission.structure_id)
      .eq('professional_id', mission.professional_id)
      .eq('mission_id', mission.id)
      .maybeSingle();

  if (existingConversationError) {
    console.error(
      'Error fetching conversation for system message:',
      existingConversationError
    );
    return;
  }

  let conversationId = existingConversation?.id;

  if (!conversationId) {
    const { data: newConversation, error: insertConversationError } =
      await supabaseAdminClient
        .from('conversations')
        .insert({
          mission_id: mission.id,
          professional_id: mission.professional_id,
          structure_id: mission.structure_id,
        })
        .select('id')
        .single();

    if (insertConversationError || !newConversation) {
      console.error(
        'Error creating conversation for system message:',
        insertConversationError
      );
      return;
    }

    conversationId = newConversation.id;
  }

  const senderId =
    actor === 'professional' ? mission.professional_id : mission.structure_id;

  const { error: insertMessageError } = await supabaseAdminClient
    .from('messages')
    .insert({
      content: status,
      conversation_id: conversationId,
      sender_id: senderId,
      type: 'system',
    });

  if (insertMessageError) {
    console.error(
      'Error inserting mission system message into conversation:',
      insertMessageError
    );
  }
}
