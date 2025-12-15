import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Buffer } from 'node:buffer';
import { Resend } from 'resend';

import { SendReportRequestBodySchema } from '../../_shared/features/reports/report.schemas.ts';
import { getReportById } from '../../_shared/features/reports/report.service.ts';
import { minifyHtml } from '../../_shared/utils/htmlMinifier.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { renderReportEmailTemplate } from '../../_shared/utils/template.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const downloadAttachments = async (
  supabaseAdminClient: SupabaseClient<Database>,
  attachments: Array<{
    file_name: string;
    file_path: string;
    mime_type: string;
  }>
): Promise<
  Array<{
    content: ArrayBuffer;
    filename: string;
    type: string;
  }>
> => {
  const downloadedAttachments = [];

  for (const attachment of attachments) {
    const { data, error } = await supabaseAdminClient.storage
      .from('report-attachments')
      .download(attachment.file_path);

    if (error || !data) {
      console.error(
        `Failed to download attachment ${attachment.file_name}:`,
        error
      );
      throw new Error(`Failed to download attachment: ${attachment.file_name}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    downloadedAttachments.push({
      content: arrayBuffer,
      filename: attachment.file_name,
      type: attachment.mime_type,
    });
  }

  return downloadedAttachments;
};

export const sendReportHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const user = get('user');
      const supabaseAdminClient = get('supabaseAdminClient');

      // Validate request body
      const validationResult = await validateRequestBody(
        SendReportRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { report_id } = validationResult.data;

      // Verify user is a professional
      const { data: profile, error: profileError } = await supabaseAdminClient
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || profile?.role !== 'professional') {
        return apiResponse.forbidden('Only professionals can send reports');
      }

      // Fetch report with full relations
      const report = await getReportById(supabaseAdminClient, report_id);

      if (!report) {
        return apiResponse.notFound('Report not found');
      }

      // Verify report belongs to authenticated professional
      if (report.author_id !== user.id) {
        return apiResponse.forbidden('You can only send your own reports');
      }

      // Check if report is already sent
      if (report.status === 'sent') {
        return apiResponse.badRequest(
          'REPORT_ALREADY_SENT',
          'This report has already been sent'
        );
      }

      // Extract structure email
      const structureEmail = report.mission.structure.profile.email;

      if (!structureEmail) {
        return apiResponse.badRequest(
          'MISSING_STRUCTURE_EMAIL',
          'Structure email address is missing'
        );
      }

      // Download attachments
      let attachments: Array<{
        content: ArrayBuffer;
        filename: string;
        type: string;
      }> = [];

      if (report.attachments && report.attachments.length > 0) {
        try {
          attachments = await downloadAttachments(
            supabaseAdminClient,
            report.attachments
          );
        } catch (error) {
          console.error('Error downloading attachments:', error);
          return apiResponse.internalServerError(
            'Failed to download report attachments',
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          );
        }
      }

      // Get Resend API key
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (!resendApiKey) {
        console.error('RESEND_API_KEY is not configured');
        return apiResponse.internalServerError(
          'Email service is not configured'
        );
      }

      // Initialize Resend
      const resend = new Resend(resendApiKey);

      // Prepare template data
      const professionalName =
        report.author.profile.first_name && report.author.profile.last_name
          ? `${report.author.profile.first_name} ${report.author.profile.last_name}`
          : report.author.profile.first_name ||
            report.author.profile.last_name ||
            'Professional';

      const templateData = {
        attachments: (report.attachments || []).map(att => ({
          file_name: att.file_name,
          file_size_kb: (att.file_size / 1024).toFixed(2),
        })),
        attachments_count: (report.attachments || []).length,
        created_at: formatDate(report.created_at),
        footer_text: `Rapport créé le: ${formatDate(report.created_at)} | Structure: ${report.mission.structure.name}`,
        has_attachments: (report.attachments || []).length > 0,
        mission_description: report.mission.description,
        mission_end_date: formatDate(report.mission.mission_until),
        mission_start_date: formatDate(report.mission.mission_dtstart),
        mission_title: report.mission.title,
        professional_email: report.author.profile.email,
        professional_name: professionalName,
        report_content: report.content,
        structure_name: report.mission.structure.name,
        title: report.title,
      };

      // Render and minify email template
      const emailHtmlRaw = renderReportEmailTemplate(templateData);
      const emailHtml = await minifyHtml(emailHtmlRaw);

      // Send email via Resend
      const emailSubject = `Rapport: ${report.title}`;
      const fromEmail = Deno.env.get('NOREPLY_EMAIL');

      if (!fromEmail) {
        console.error('NOREPLY_EMAIL is not configured');
        return apiResponse.internalServerError(
          'Email service is not configured'
        );
      }

      const { data: emailData, error: emailError } = await resend.emails.send({
        attachments:
          attachments.length > 0
            ? attachments.map(att => ({
                content: Buffer.from(att.content),
                filename: att.filename,
              }))
            : undefined,
        from: fromEmail,
        html: emailHtml,
        subject: emailSubject,
        to: structureEmail,
      });

      if (emailError) {
        console.error('Error sending email via Resend:', emailError);
        return apiResponse.internalServerError('Failed to send email', {
          error: emailError.message || 'Unknown error',
        });
      }

      // Update report status to 'sent'
      const { error: updateError } = await supabaseAdminClient
        .from('reports')
        .update({ status: 'sent' })
        .eq('id', report_id);

      if (updateError) {
        console.error('Error updating report status:', updateError);
        // Email was sent but status update failed - log for manual intervention
        return apiResponse.internalServerError(
          'Email sent but failed to update report status',
          {
            emailId: emailData?.id,
            error: updateError.message,
          }
        );
      }

      return apiResponse.ok({
        emailId: emailData?.id,
        message: 'Report sent successfully',
        reportId: report_id,
      });
    } catch (error) {
      console.error('Error in sendReportHandler:', error);
      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while sending the report'
      );
    }
  }
);
