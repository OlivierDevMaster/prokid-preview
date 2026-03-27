import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const InviteProfessionalSchema = z.object({
  currentJob: z.string().optional(),
  email: z.string().email('Email invalide'),
  firstName: z.string().optional(),
  invitedBy: z.string().uuid('ID invitant invalide'),
  lastName: z.string().optional(),
});

type InviteProfessionalBody = z.infer<typeof InviteProfessionalSchema>;

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

function buildInvitationEmailHtml(params: {
  adminName: string;
  appUrl: string;
  resetLink: string;
}): string {
  const { adminName, appUrl, resetLink } = params;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur ProKid !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">ProKid</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Bienvenue sur ProKid !</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${adminName} vous invite à rejoindre ProKid, la plateforme de mise en relation pour les professionnels de la petite enfance. Cliquez ci-dessous pour créer votre mot de passe et accéder à la plateforme.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Créer mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} ProKid. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const inviteProfessionalHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const validationResult = await validateRequestBody(
        InviteProfessionalSchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const body: InviteProfessionalBody = validationResult.data;
      const userId = get('user')?.id;
      const supabaseAdminClient = get('supabaseAdminClient');

      if (!userId || !supabaseAdminClient) {
        return apiResponse.unauthorized();
      }

      // Verify user is an admin
      const { data: profile, error: profileError } = await supabaseAdminClient
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (profileError || profile?.role !== 'admin') {
        return apiResponse.forbidden(
          'Seuls les administrateurs peuvent inviter des professionnels'
        );
      }

      // Check if user with this email already exists
      const { data: existingUsers } =
        await supabaseAdminClient.auth.admin.listUsers();

      const emailExists = existingUsers?.users?.some(
        (u) => u.email?.toLowerCase() === body.email.toLowerCase()
      );

      if (emailExists) {
        return apiResponse.conflict(
          'EMAIL_ALREADY_EXISTS',
          'Un compte avec cet email existe déjà'
        );
      }

      // Create the user via admin API
      const { data: newUser, error: createError } =
        await supabaseAdminClient.auth.admin.createUser({
          email: body.email,
          email_confirm: true,
          user_metadata: {
            first_name: body.firstName || '',
            last_name: body.lastName || '',
            preferred_language: 'fr',
            role: 'professional',
          },
        });

      if (createError || !newUser?.user) {
        console.error('Error creating user:', createError);
        return apiResponse.internalServerError(
          "Erreur lors de la création de l'utilisateur"
        );
      }

      const newUserId = newUser.user.id;

      // Update profile with invitation info
      const { error: profileUpdateError } = await supabaseAdminClient
        .from('profiles')
        .update({
          first_name: body.firstName || null,
          invitation_status: 'invited',
          invited_by: body.invitedBy,
          last_name: body.lastName || null,
        })
        .eq('user_id', newUserId);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
      }

      // Update professionals table with current_job if provided
      if (body.currentJob) {
        const { error: professionalUpdateError } = await supabaseAdminClient
          .from('professionals')
          .update({
            current_job: body.currentJob,
          })
          .eq('user_id', newUserId);

        if (professionalUpdateError) {
          console.error(
            'Error updating professional:',
            professionalUpdateError
          );
        }
      }

      // Generate recovery link for password setup
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
      const { data: linkData, error: linkError } =
        await supabaseAdminClient.auth.admin.generateLink({
          email: body.email,
          options: {
            redirectTo: `${appUrl}/fr/auth/callback?next=/fr/professional/onboarding`,
          },
          type: 'recovery',
        });

      if (linkError || !linkData?.properties?.action_link) {
        console.error('Error generating recovery link:', linkError);
        return apiResponse.internalServerError(
          'Utilisateur créé mais erreur lors de la génération du lien'
        );
      }

      const resetLink = linkData.properties.action_link;

      // Send invitation email via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const fromEmail = Deno.env.get('NOREPLY_EMAIL');

      if (resendApiKey && fromEmail) {
        const adminName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(' ') || 'Un administrateur';

        const resend = new Resend(resendApiKey);
        const { error: emailError } = await resend.emails.send({
          from: fromEmail,
          html: buildInvitationEmailHtml({
            adminName,
            appUrl,
            resetLink,
          }),
          subject: 'Bienvenue sur ProKid !',
          to: body.email,
        });

        if (emailError) {
          console.error('[inviteProfessional] Resend error:', emailError);
        }
      } else {
        console.warn(
          '[inviteProfessional] RESEND_API_KEY or NOREPLY_EMAIL not set; skipping email'
        );
      }

      // Schedule follow-up reminders (J+3, J+7, J+14, J+30)
      const now = new Date();
      const reminders = [
        { days: 3, type: 'j3' },
        { days: 7, type: 'j7' },
        { days: 14, type: 'j14' },
        { days: 30, type: 'j30' },
      ];

      await supabaseAdminClient
        .from('invitation_reminders')
        .insert(
          reminders.map(r => ({
            profile_id: newUserId,
            reminder_type: r.type,
            scheduled_at: new Date(now.getTime() + r.days * 24 * 60 * 60 * 1000).toISOString(),
          }))
        );

      return apiResponse.created({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        userId: newUserId,
      });
    } catch (error) {
      console.error('Error in inviteProfessionalHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
