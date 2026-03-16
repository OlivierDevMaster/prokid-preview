-- Migration: create_conversations_and_messages
-- Purpose: Create conversations and messages tables for chat between structures and professionals
-- Affected tables: conversations, messages
-- Dependencies: Requires structures, professionals, missions, profiles tables to exist

-- ============================================================================
-- Model: conversations
-- ============================================================================

create table if not exists "public"."conversations" (
  "id" uuid default gen_random_uuid() not null primary key,
  "structure_id" uuid not null references "public"."structures"("user_id") on delete cascade,
  "professional_id" uuid not null references "public"."professionals"("user_id") on delete cascade,
  "mission_id" uuid references "public"."missions"("id") on delete set null,
  "last_message_at" timestamp with time zone,
  "last_message_preview" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

comment on table "public"."conversations" is 'Chat threads between a structure and a professional, optionally linked to a mission';
comment on column "public"."conversations"."structure_id" is 'Reference to the structure';
comment on column "public"."conversations"."professional_id" is 'Reference to the professional';
comment on column "public"."conversations"."mission_id" is 'Optional reference to a mission this conversation is about';
comment on column "public"."conversations"."last_message_at" is 'Timestamp of the last message in this conversation';
comment on column "public"."conversations"."last_message_preview" is 'Short preview of the last message for list display';

-- Unique: one general conversation per (structure, professional)
create unique index "idx_conversations_unique_pair"
  on "public"."conversations" ("structure_id", "professional_id");


create index if not exists "idx_conversations_structure_id" on "public"."conversations" ("structure_id");
create index if not exists "idx_conversations_professional_id" on "public"."conversations" ("professional_id");
create index if not exists "idx_conversations_mission_id" on "public"."conversations" ("mission_id");
create index if not exists "idx_conversations_structure_professional" on "public"."conversations" ("structure_id", "professional_id");
create index if not exists "idx_conversations_last_message_at" on "public"."conversations" ("last_message_at" desc nulls last);

-- Trigger: update updated_at
create trigger update_conversations_updated_at
  before update on "public"."conversations"
  for each row execute function public.update_updated_at_column();

-- ============================================================================
-- Function: check_conversation_membership_and_mission
-- ============================================================================
-- When mission_id is set, ensures the mission belongs to this structure and professional.
-- No membership required: any structure can have a conversation with any professional.

create or replace function "public"."check_conversation_membership_and_mission"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- If mission_id is set, mission must belong to this structure and professional
  if new."mission_id" is not null then
    if not exists (
      select 1 from "public"."missions"
      where "id" = new."mission_id"
        and "structure_id" = new."structure_id"
        and "professional_id" = new."professional_id"
    ) then
      raise exception 'Mission % does not belong to structure % and professional %.', new."mission_id", new."structure_id", new."professional_id";
    end if;
  end if;

  return new;
end;
$$;

comment on function "public"."check_conversation_membership_and_mission"() is 'When mission_id is set, ensures the mission belongs to this structure and professional. Any structure can converse with any professional.';

create trigger "trigger_check_conversation_membership_and_mission"
  before insert or update of "structure_id", "professional_id", "mission_id" on "public"."conversations"
  for each row execute function "public"."check_conversation_membership_and_mission"();

-- ============================================================================
-- Model: messages
-- ============================================================================

create table if not exists "public"."messages" (
  "id" uuid default gen_random_uuid() not null primary key,
  "conversation_id" uuid not null references "public"."conversations"("id") on delete cascade,
  "sender_id" uuid not null references "public"."profiles"("user_id") on delete cascade,
  "content" text not null,
  "type" text not null default 'text' check ("type" in ('text', 'appointment_link', 'system')),
  "status" text check ("status" is null or "status" in ('pending', 'confirmed', 'rejected', 'cancelled')),
  "created_at" timestamp with time zone default now() not null
);

comment on table "public"."messages" is 'Chat messages within a conversation';
comment on column "public"."messages"."conversation_id" is 'Reference to the conversation';
comment on column "public"."messages"."sender_id" is 'User who sent the message (structure or professional participant)';
comment on column "public"."messages"."content" is 'Message text content';
comment on column "public"."messages"."type" is 'Message type: text, appointment_link, or system';
comment on column "public"."messages"."status" is 'For appointment_link: pending, confirmed, rejected, or cancelled';

create index if not exists "idx_messages_conversation_id" on "public"."messages" ("conversation_id");
create index if not exists "idx_messages_created_at" on "public"."messages" ("created_at");
create index if not exists "idx_messages_conversation_created" on "public"."messages" ("conversation_id", "created_at");

-- ============================================================================
-- Function: check_message_sender_is_participant
-- ============================================================================

create or replace function "public"."check_message_sender_is_participant"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from "public"."conversations" c
    where c."id" = new."conversation_id"
      and (c."structure_id" = new."sender_id" or c."professional_id" = new."sender_id")
  ) then
    raise exception 'Sender % is not a participant of conversation %.', new."sender_id", new."conversation_id";
  end if;
  return new;
end;
$$;

comment on function "public"."check_message_sender_is_participant"() is 'Ensures the message sender is either the structure or professional of the conversation';

create trigger "trigger_check_message_sender_is_participant"
  before insert or update of "sender_id", "conversation_id" on "public"."messages"
  for each row execute function "public"."check_message_sender_is_participant"();

-- ============================================================================
-- Function: update_conversation_last_message
-- ============================================================================

create or replace function "public"."update_conversation_last_message"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update "public"."conversations"
  set
    "last_message_at" = new."created_at",
    "last_message_preview" = case
      when new."type" = 'appointment_link' then 'Rendez-vous proposé'
      else left(new."content", 80)
    end,
    "updated_at" = now()
  where "id" = new."conversation_id";
  return new;
end;
$$;

comment on function "public"."update_conversation_last_message"() is 'Updates conversation last_message_at and last_message_preview when a message is inserted';

create trigger "trigger_update_conversation_last_message"
  after insert on "public"."messages"
  for each row execute function "public"."update_conversation_last_message"();

-- ============================================================================
-- RLS: conversations
-- ============================================================================

alter table "public"."conversations" enable row level security;

-- Structures can view conversations where they are the structure
create policy "Structures can view their conversations" on "public"."conversations"
  for select to authenticated
  using ((select auth.uid()) = "structure_id");

-- Structures can create conversations (with CHECK for structure role)
create policy "Structures can create conversations" on "public"."conversations"
  for insert to authenticated
  with check (
    (select auth.uid()) = "structure_id"
    and exists (
      select 1 from public.profiles
      where user_id = (select auth.uid()) and role = 'structure'
    )
  );

-- Structures can update their conversations
create policy "Structures can update their conversations" on "public"."conversations"
  for update to authenticated
  using ((select auth.uid()) = "structure_id")
  with check ((select auth.uid()) = "structure_id");

-- Structures can delete their conversations
create policy "Structures can delete their conversations" on "public"."conversations"
  for delete to authenticated
  using ((select auth.uid()) = "structure_id");

-- Professionals can view conversations where they are the professional
create policy "Professionals can view their conversations" on "public"."conversations"
  for select to authenticated
  using ((select auth.uid()) = "professional_id");

-- Professionals can create conversations (participant is professional)
create policy "Professionals can create conversations" on "public"."conversations"
  for insert to authenticated
  with check (
    (select auth.uid()) = "professional_id"
    and exists (
      select 1 from public.profiles
      where user_id = (select auth.uid()) and role = 'professional'
    )
  );

-- Professionals can update their conversations
create policy "Professionals can update their conversations" on "public"."conversations"
  for update to authenticated
  using ((select auth.uid()) = "professional_id")
  with check ((select auth.uid()) = "professional_id");

-- Professionals can delete their conversations
create policy "Professionals can delete their conversations" on "public"."conversations"
  for delete to authenticated
  using ((select auth.uid()) = "professional_id");

-- Admins can view all conversations
create policy "Admins can view all conversations" on "public"."conversations"
  for select to authenticated
  using ((select public.is_admin()));

-- Admins can create conversations
create policy "Admins can create conversations" on "public"."conversations"
  for insert to authenticated
  with check ((select public.is_admin()));

-- Admins can update all conversations
create policy "Admins can update all conversations" on "public"."conversations"
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Admins can delete all conversations
create policy "Admins can delete all conversations" on "public"."conversations"
  for delete to authenticated
  using ((select public.is_admin()));

-- ============================================================================
-- RLS: messages
-- ============================================================================

alter table "public"."messages" enable row level security;

-- Structures can view messages in their conversations
create policy "Structures can view messages in their conversations" on "public"."messages"
  for select to authenticated
  using (
    exists (
      select 1 from "public"."conversations" c
      where c."id" = "conversation_id" and c."structure_id" = (select auth.uid())
    )
  );

-- Structures can insert messages in their conversations (sender must be structure; validated by trigger)
create policy "Structures can insert messages in their conversations" on "public"."messages"
  for insert to authenticated
  with check (
    (select auth.uid()) = "sender_id"
    and exists (
      select 1 from "public"."conversations" c
      where c."id" = "conversation_id" and c."structure_id" = (select auth.uid())
    )
  );

-- Professionals can view messages in their conversations
create policy "Professionals can view messages in their conversations" on "public"."messages"
  for select to authenticated
  using (
    exists (
      select 1 from "public"."conversations" c
      where c."id" = "conversation_id" and c."professional_id" = (select auth.uid())
    )
  );

-- Professionals can insert messages in their conversations
create policy "Professionals can insert messages in their conversations" on "public"."messages"
  for insert to authenticated
  with check (
    (select auth.uid()) = "sender_id"
    and exists (
      select 1 from "public"."conversations" c
      where c."id" = "conversation_id" and c."professional_id" = (select auth.uid())
    )
  );

-- Professionals or Structures can update their own messages
create policy "Professionals or Structures can update their own messages" on public.messages
  for update to authenticated
  using (
    sender_id = auth.uid()
  )
  with check (
    sender_id = auth.uid()
  );

-- Structures can update appointment_link status in their conversations
create policy "Structures can update appointment status in their conversations" on public.messages
  for update to authenticated
  using (
    type = 'appointment_link'
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.structure_id = auth.uid()
    )
  )
  with check (
    type = 'appointment_link'
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.structure_id = auth.uid()
    )
  );

-- Participants can delete their own messages
create policy "Participants can delete their own messages" on public.messages
  for delete to authenticated
  using (sender_id = auth.uid());

-- Admins can view all messages
create policy "Admins can view all messages" on "public"."messages"
  for select to authenticated
  using ((select public.is_admin()));

-- Admins can insert messages
create policy "Admins can insert messages" on "public"."messages"
  for insert to authenticated
  with check ((select public.is_admin()));

-- Admins can update all messages
create policy "Admins can update all messages" on "public"."messages"
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Admins can delete all messages
create policy "Admins can delete all messages" on "public"."messages"
  for delete to authenticated
  using ((select public.is_admin()));
