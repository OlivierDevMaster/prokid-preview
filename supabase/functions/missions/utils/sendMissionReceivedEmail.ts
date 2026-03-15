import { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { renderNotificationEmailTemplate } from '../../_shared/services/templates/renderNotificationEmailTemplate.ts';
import { Database } from '../../../../types/database/schema.ts';

const missionReceivedTranslations = {
  en: {
    description: (data: { mission_title: string }) =>
      `You have received a new mission: ${data.mission_title}`,
    title: (data: { mission_title: string }) =>
      `New mission: ${data.mission_title}`,
  },
  fr: {
    description: (data: { mission_title: string }) =>
      `Vous avez reçu une nouvelle mission : ${data.mission_title}`,
    title: (data: { mission_title: string }) =>
      `Nouvelle mission : ${data.mission_title}`,
  },
};

export async function sendMissionReceivedEmail(
  supabaseAdminClient: SupabaseClient<Database>,
  mission: {
    id: string;
    professional_id: string;
    structure_id: string;
    title: string;
  },
  structureName: string
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('NOREPLY_EMAIL');
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

  if (!resendApiKey || !fromEmail) {
    console.warn(
      '[sendMissionReceivedEmail] RESEND_API_KEY or NOREPLY_EMAIL not set; skipping email'
    );
    return;
  }

  // Get or create conversation so the email CTA can link to chat with it selected
  let conversationId: null | string = null;
  const { data: existingConversation } = await supabaseAdminClient
    .from('conversations')
    .select('id')
    .eq('structure_id', mission.structure_id)
    .eq('professional_id', mission.professional_id)
    .single();

  if (existingConversation) {
    await supabaseAdminClient
      .from('conversations')
      .update({
        mission_id: mission.id,
      })
      .eq('id', existingConversation.id);
    conversationId = existingConversation.id;
  } else {
    const { data: newConversation, error: insertConvError } =
      await supabaseAdminClient
        .from('conversations')
        .insert({
          mission_id: mission.id,
          professional_id: mission.professional_id,
          structure_id: mission.structure_id,
        })
        .select('id')
        .single();

    if (!insertConvError && newConversation) {
      conversationId = newConversation.id;
    }
  }

  const { data: notifications } = await supabaseAdminClient
    .from('notifications')
    .select('id, data')
    .eq('type', 'mission_received')
    .eq('recipient_id', mission.professional_id)
    .order('created_at', { ascending: false })
    .limit(5);

  const notificationRow = (notifications ?? []).find(
    n => (n.data as { mission_id?: string })?.mission_id === mission.id
  );

  if (!notificationRow) {
    console.warn(
      '[sendMissionReceivedEmail] No notification found for mission',
      mission.id
    );
    return;
  }

  const { data: recipientProfile } = await supabaseAdminClient
    .from('profiles')
    .select('email, preferred_language')
    .eq('user_id', mission.professional_id)
    .single();

  if (!recipientProfile?.email) {
    console.warn(
      '[sendMissionReceivedEmail] No email for professional',
      mission.professional_id
    );
    return;
  }

  const { data: prefs } = await supabaseAdminClient
    .from('professional_notification_preferences')
    .select('email_notifications')
    .eq('user_id', mission.professional_id)
    .single();

  const emailEnabled = prefs?.email_notifications ?? true;
  if (!emailEnabled) return;

  const locale = (recipientProfile.preferred_language as 'en' | 'fr') || 'fr';
  const viewChatUrl =
    conversationId &&
    `${appUrl}/${locale}/professional/chat?conversationId=${conversationId}`;
  const notificationData: Record<string, unknown> = {
    mission_title: mission.title,
    structure_name: structureName,
    ...(viewChatUrl && { view_chat_url: viewChatUrl }),
  };
  const translations = missionReceivedTranslations[locale];
  const translationData = { mission_title: mission.title };

  const emailHtml = await renderNotificationEmailTemplate({
    appUrl,
    locale,
    notification: {
      data: notificationData,
      id: notificationRow.id,
      recipient_id: mission.professional_id,
      recipient_role: 'professional',
      type: 'mission_received',
    },
    translations: {
      description: translations.description(translationData),
      title: translations.title(translationData),
    },
  });

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    html: emailHtml,
    subject: translations.title(translationData),
    to: recipientProfile.email,
  });

  if (error) {
    console.error('[sendMissionReceivedEmail] Resend error:', error);
  }
}
