import type { MissionDurations } from '../../../../features/mission-durations/missionDuration.model.ts';

export const MissionDurationsTestData = {
  dailyRRULE: 'DTSTART:20250101T090000Z\nRRULE:FREQ=DAILY;COUNT=10',

  expectedResponseStructure: {
    future_duration_mn: 0,
    past_duration_mn: 0,
    percentage: 0,
    total_duration_mn: 0,
  } as MissionDurations,

  monthlyRRULE:
    'DTSTART:20250101T090000Z\nRRULE:FREQ=MONTHLY;BYMONTHDAY=1;UNTIL=20251231T180000Z',

  rruleWithEXDATE:
    'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T180000Z\nEXDATE:20250108T090000Z',

  validQueryParams: {
    professional_id: 'test-professional-id',
    structure_id: 'test-structure-id',
  },

  weeklyRRULE:
    'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T180000Z',
};
