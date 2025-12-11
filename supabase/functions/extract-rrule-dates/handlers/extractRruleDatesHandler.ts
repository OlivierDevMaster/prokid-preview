import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import { z } from 'zod';

import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

const ExtractRruleDatesSchema = z.object({
  record_id: z.uuid('Invalid record ID format'),
  table_name: z.enum(['mission_schedules', 'availabilities'], {
    message: 'table_name must be mission_schedules or availabilities',
  }),
});

export const extractRruleDatesHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      const validationResult = await validateRequestBody(
        ExtractRruleDatesSchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const body = validationResult.data;
      const supabaseAdminClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (!supabaseAdminClient) {
        return apiResponse.unauthorized();
      }

      // Fetch the record
      const { data: record, error: fetchError } = await supabaseAdminClient
        .from(body.table_name)
        .select('id, rrule')
        .eq('id', body.record_id)
        .maybeSingle();

      if (fetchError || !record) {
        return apiResponse.notFound('Record not found');
      }

      if (!record.rrule) {
        return apiResponse.badRequest(
          'INVALID_RECORD',
          'Record has no rrule field'
        );
      }

      // Parse RRULE using rrule library
      let dtstart: Date | null = null;
      let until: Date | null = null;

      try {
        const rule = rrulestr(record.rrule);
        dtstart = rule.options.dtstart || null;
        until = rule.options.until || null;
      } catch (rruleError) {
        console.error('Error parsing RRULE:', rruleError);
        return apiResponse.badRequest(
          'INVALID_RRULE',
          'Failed to parse RRULE',
          {
            error: String(rruleError),
          }
        );
      }

      // Update the record
      const updateData: {
        dtstart?: null | string;
        until?: null | string;
      } = {};

      if (dtstart) {
        updateData.dtstart = dtstart.toISOString();
      } else {
        updateData.dtstart = null;
      }

      if (until) {
        updateData.until = until.toISOString();
      } else {
        updateData.until = null;
      }

      const { error: updateError } = await supabaseAdminClient
        .from(body.table_name)
        .update(updateData)
        .eq('id', body.record_id);

      if (updateError) {
        console.error('Error updating record:', updateError);
        return apiResponse.internalServerError('Failed to update record');
      }

      return apiResponse.ok({
        dtstart: dtstart?.toISOString() || null,
        until: until?.toISOString() || null,
      });
    } catch (error) {
      console.error('Error in extractRruleDatesHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
