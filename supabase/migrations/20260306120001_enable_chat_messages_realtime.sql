-- Migration: enable_chat_messages_realtime
-- Purpose: Enable realtime broadcasting for messages table using broadcast triggers
-- Affected tables: messages, realtime.messages
-- Dependencies: Requires messages table and realtime extension to exist

-- ============================================================================
-- Function: messages_broadcast_trigger
-- ============================================================================

-- Broadcast message changes to conversation-specific channels
-- Topic format: conversation:{conversation_id}:messages
create or replace function "public"."messages_broadcast_trigger"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.broadcast_changes(
    'conversation:' || coalesce(new."conversation_id", old."conversation_id")::text || ':messages',
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return coalesce(new, old);
end;
$$;

comment on function "public"."messages_broadcast_trigger"() is 'Broadcasts message changes to conversation-specific realtime channels using the pattern conversation:{conversation_id}:messages';

-- ============================================================================
-- Trigger: messages_broadcast_trigger
-- ============================================================================

create trigger "trigger_messages_broadcast"
  after insert or update or delete on "public"."messages"
  for each row execute function "public"."messages_broadcast_trigger"();

-- ============================================================================
-- RLS Policies: realtime.messages
-- ============================================================================

alter table if exists "realtime"."messages" enable row level security;

-- Participants of a conversation can read broadcasts for that conversation
-- Topic format: conversation:{conversation_id}:messages
create policy "Conversation participants can read message broadcasts" on "realtime"."messages"
  for select to authenticated
  using (
    topic like 'conversation:%:messages'
    and exists (
      select 1 from "public"."conversations" c
      where c."id" = (split_part(topic, ':', 2))::uuid
        and (c."structure_id" = (select auth.uid()) or c."professional_id" = (select auth.uid()))
    )
  );

-- Admins can read all conversation message broadcasts
create policy "Admins can read conversation message broadcasts" on "realtime"."messages"
  for select to authenticated
  using (
    topic like 'conversation:%:messages'
    and (select public.is_admin())
  );

-- ============================================================================
-- Indexes: realtime.messages (for RLS policy performance)
-- ============================================================================

create index if not exists "idx_realtime_messages_topic_conversation_messages" on "realtime"."messages"
  using btree (topic text_pattern_ops)
  where topic like 'conversation:%:messages';
