import RRulePkg from 'rrule';

const { RRuleSet, rrulestr } = RRulePkg;

export type DurationCalculation = {
  future_duration_mn: number;
  past_duration_mn: number;
  total_duration_mn: number;
};

export type MissionSchedule = {
  duration_mn: number;
  rrule: string;
};

/**
 * Calculates duration metrics for a single schedule.
 * Splits occurrences by current date/time and calculates past, future, and total durations.
 */
export function calculateScheduleDuration(
  schedule: MissionSchedule,
  occurrences: Date[],
  now: Date
): DurationCalculation {
  // Split occurrences by current date
  const pastOccurrences = occurrences.filter(occ => occ < now);
  const futureOccurrences = occurrences.filter(occ => occ >= now);

  // Calculate durations
  const totalDurationMn = occurrences.length * schedule.duration_mn;
  const pastDurationMn = pastOccurrences.length * schedule.duration_mn;
  const futureDurationMn = futureOccurrences.length * schedule.duration_mn;

  return {
    future_duration_mn: futureDurationMn,
    past_duration_mn: pastDurationMn,
    total_duration_mn: totalDurationMn,
  };
}

/**
 * Generates all occurrences for a mission schedule.
 * Parses the RRULE directly (source of truth) and generates occurrences.
 * Only includes occurrences that fall within the mission date range.
 * Handles both RRule and RRuleSet (when EXDATE is present).
 * Supports RRULEs with UNTIL, COUNT, or neither.
 */
export function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  // Parse the RRULE directly - it's the source of truth
  const rule = rrulestr(schedule.rrule);

  // Determine the date range for generating occurrences
  // Use the RRULE's own DTSTART if present, otherwise use mission start
  // For the end, we need to handle UNTIL, COUNT, or neither
  let scheduleStart: Date;
  let scheduleEnd: Date;

  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRulePkg.RRuleSet).rrules === 'function'
  ) {
    // It's an RRuleSet - get dtstart/until from the first RRule
    const rruleSet = rule as RRulePkg.RRuleSet;
    const rules = rruleSet.rrules();

    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleStart = firstRule.options.dtstart || missionDtstart;
      // If UNTIL exists, use it; if COUNT exists, we need to generate all and filter
      // Otherwise, use missionUntil as a safe upper bound
      scheduleEnd = firstRule.options.until || missionUntil;
    } else {
      return [];
    }
  } else {
    // It's a regular RRule
    const rrule = rule as RRulePkg.RRule;
    scheduleStart = rrule.options.dtstart || missionDtstart;
    // If UNTIL exists, use it; if COUNT exists, we need to generate all and filter
    // Otherwise, use missionUntil as a safe upper bound
    scheduleEnd = rrule.options.until || missionUntil;
  }

  // Generate all occurrences from the RRULE
  // If COUNT is present, this will generate exactly COUNT occurrences
  // If UNTIL is present, this will generate up to UNTIL
  // We'll filter by mission range afterwards to ensure we only count valid occurrences
  const allOccurrences = rule.between(scheduleStart, scheduleEnd, true);

  // Filter occurrences to only include those within the mission date range
  return allOccurrences.filter(
    occ => occ >= missionDtstart && occ <= missionUntil
  );
}
