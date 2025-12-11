import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { RRuleSet, rrulestr } = RRulePkg;

import { z } from 'zod';

import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

/**
 * Extracts dtstart and until from an RRule or RRuleSet
 * For RRuleSet: returns the minimum dtstart and maximum until across all rules
 * For RRule: returns the dtstart and until from the rule's options
 */
const extractDatesFromRule = (
  rule: RRulePkg.RRule | RRulePkg.RRuleSet
): {
  dtstart: Date | null;
  until: Date | null;
} => {
  // Check if it's an RRuleSet by checking for rrules method
  // When rrulestr() parses a string with EXDATE, it returns an RRuleSet
  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRulePkg.RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRulePkg.RRuleSet;
    // Get all rules from the RRuleSet
    const rules = rruleSet.rrules();
    const exrules = rruleSet.exrules();

    // Collect all dtstart and until values from all rules
    const dtstarts: Date[] = [];
    const untils: Date[] = [];

    // Process main rules
    for (const r of rules) {
      if (r.options.dtstart) {
        dtstarts.push(r.options.dtstart);
      }
      if (r.options.until) {
        untils.push(r.options.until);
      }
    }

    // Process exclusion rules (they might also have dtstart/until)
    for (const r of exrules) {
      if (r.options.dtstart) {
        dtstarts.push(r.options.dtstart);
      }
      if (r.options.until) {
        untils.push(r.options.until);
      }
    }

    // Return minimum dtstart and maximum until
    return {
      dtstart:
        dtstarts.length > 0
          ? new Date(Math.min(...dtstarts.map(d => d.getTime())))
          : null,
      until:
        untils.length > 0
          ? new Date(Math.max(...untils.map(d => d.getTime())))
          : null,
    };
  }

  // It's a regular RRule
  return {
    dtstart: rule.options.dtstart || null,
    until: rule.options.until || null,
  };
};

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
      // Note: rrulestr() can return either RRule or RRuleSet (when EXDATE is present)
      let dtstart: Date | null = null;
      let until: Date | null = null;

      try {
        const rule = rrulestr(record.rrule);
        const extractedDates = extractDatesFromRule(rule);
        dtstart = extractedDates.dtstart;
        until = extractedDates.until;
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
