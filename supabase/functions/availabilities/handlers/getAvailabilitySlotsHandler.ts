import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import {
  addMinutes,
  compareAsc,
  formatISO,
  isAfter,
  isValid,
  parseISO,
} from 'date-fns';
// ! rrule package is a CommonJS package, so we need to import it as a namespace
// ! and then destructure the rrulestr function from it
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import {
  AvailabilitySlot,
  GetAvailabilitySlotsQuerySchema,
} from '../../_shared/features/availabilities/index.ts';
import { validateRequestQuery } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

export const getAvailabilitySlotsHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      const supabaseClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const validationResult = validateRequestQuery(
        GetAvailabilitySlotsQuerySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { endAt, professionalId, startAt } = validationResult.data;

      const startDate = parseISO(startAt);
      const endDate = parseISO(endAt);

      if (!isValid(startDate) || !isValid(endDate)) {
        return apiResponse.badRequest(
          'INVALID_DATE_FORMAT',
          'Invalid date format. Dates must be in ISO 8601 format.'
        );
      }

      if (
        isAfter(startDate, endDate) ||
        startDate.getTime() === endDate.getTime()
      ) {
        return apiResponse.badRequest(
          'INVALID_DATE_RANGE',
          'startAt must be before endAt'
        );
      }

      const { data: availabilities, error } = await supabaseClient
        .from('availabilities')
        .select('duration_mn, id, rrule')
        .eq('user_id', professionalId);

      if (error) {
        console.error('Error fetching availabilities:', error);
        return apiResponse.internalServerError(
          'Failed to fetch availabilities'
        );
      }

      if (!availabilities || availabilities.length === 0) {
        return apiResponse.ok([]);
      }

      const slots: AvailabilitySlot[] = [];

      for (const availability of availabilities) {
        try {
          const rule = rrulestr(availability.rrule);

          const occurrences = rule.between(startDate, endDate, true);

          for (const occurrence of occurrences) {
            const slotStartAt = formatISO(occurrence);
            const slotEndAt = formatISO(
              addMinutes(occurrence, availability.duration_mn)
            );

            slots.push({
              endAt: slotEndAt,
              startAt: slotStartAt,
            });
          }
        } catch (rruleError) {
          console.error(
            `Error parsing rrule for availability ${availability.id}:`,
            rruleError
          );
        }
      }

      slots.sort((a, b) =>
        compareAsc(parseISO(a.startAt), parseISO(b.startAt))
      );

      return apiResponse.ok(slots);
    } catch (error) {
      console.error('Error in getAvailabilitySlotsHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
