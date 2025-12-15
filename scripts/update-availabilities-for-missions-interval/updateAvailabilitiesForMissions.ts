import { Options, RRule, RRuleSet, rrulestr } from 'rrule';

/**
 * Represents a new availability that needs to be created
 */
export interface AvailabilityToCreate {
  duration_mn: number;
  rrule: string;
}

/**
 * Represents an availability that needs to be updated
 */
export interface AvailabilityToUpdate {
  newDurationMn?: number;
  newRrule: string;
  originalAvailability: ProfessionalAvailability;
}

/**
 * Result of calculating availability updates for missions
 */
export interface AvailabilityUpdateResult {
  toCreate: AvailabilityToCreate[];
  toUpdate: AvailabilityToUpdate[];
}

/**
 * Represents a mission schedule with RRULE and duration
 */
export interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

/**
 * Represents a professional availability with RRULE and duration
 */
export interface ProfessionalAvailability {
  duration_mn: number;
  rrule: string;
}

/**
 * Represents a time interval with start and end dates
 */
interface TimeInterval {
  end: Date;
  // Metadata to help reconstruct RRULE patterns
  originalPattern?: {
    duration_mn: number;
    rrule: string;
  };
  start: Date;
}

/**
 * Calculates which professional availabilities need to be updated or created
 * to block out mission periods using an interval subtraction approach.
 *
 * This implementation:
 * 1. Converts availabilities to intervals
 * 2. Converts mission schedules to intervals
 * 3. Subtracts mission intervals from availability intervals
 * 4. Groups remaining intervals by pattern
 * 5. Creates/updates availabilities based on grouped intervals
 *
 * @param availabilities - Array of professional availabilities with RRULE and duration
 * @param missionSchedules - Array of mission schedules with RRULE and duration
 * @param missionDtstart - Mission start date (from missions table)
 * @param missionUntil - Mission end date (from missions table)
 * @returns Result with availabilities to update and create
 */
export function updateAvailabilitiesForMissions(
  availabilities: ProfessionalAvailability[],
  missionSchedules: MissionSchedule[],
  missionDtstart: Date,
  missionUntil: Date
): AvailabilityUpdateResult {
  const toUpdate: AvailabilityToUpdate[] = [];
  const toCreate: AvailabilityToCreate[] = [];

  // Step 1: Convert all mission schedules to intervals
  const missionIntervals: TimeInterval[] = [];
  for (const schedule of missionSchedules) {
    // Generate all mission occurrences for this schedule
    const missionOccurrences = generateMissionOccurrences(
      schedule,
      missionDtstart,
      missionUntil
    );

    // Convert each occurrence to an interval
    for (const missionOcc of missionOccurrences) {
      const missionEnd = new Date(
        missionOcc.getTime() + schedule.duration_mn * 60 * 1000
      );
      missionIntervals.push({
        end: missionEnd,
        start: missionOcc,
      });
    }
  }

  // Sort mission intervals by start time for efficient processing
  missionIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Step 2: Process each availability
  for (let availIndex = 0; availIndex < availabilities.length; availIndex++) {
    const availability = availabilities[availIndex];

    // Convert availability to intervals
    const availabilityIntervals = convertAvailabilityToIntervals(
      availability,
      missionDtstart,
      missionUntil
    );

    if (availabilityIntervals.length === 0) {
      continue; // No occurrences in the mission period
    }

    // Step 3: Subtract mission intervals from availability intervals
    const remainingIntervals = subtractIntervals(
      availabilityIntervals,
      missionIntervals
    );

    if (remainingIntervals.length === 0) {
      // All availability is blocked - just update original to stop before schedule
      const earliestScheduleDtstart = findEarliestScheduleDtstart(
        missionSchedules,
        availability,
        missionDtstart,
        missionUntil
      );
      if (earliestScheduleDtstart) {
        const untilBeforeSchedule = new Date(earliestScheduleDtstart);
        untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
        const originalRule = rrulestr(availability.rrule);
        const baseRule = getBaseRule(originalRule);
        const updatedRrule = createAvailabilityWithUntil(
          baseRule.options,
          untilBeforeSchedule
        );
        toUpdate.push({
          newRrule: updatedRrule,
          originalAvailability: availability,
        });
      }
      continue;
    }

    // Step 4: Group remaining intervals and create/update availabilities
    const groupedIntervals = groupIntervalsByPeriod(
      remainingIntervals,
      missionSchedules,
      missionDtstart,
      missionUntil
    );

    // Process grouped intervals
    processGroupedIntervals(
      groupedIntervals,
      availability,
      missionSchedules,
      missionDtstart,
      missionUntil,
      toUpdate,
      toCreate
    );
  }

  return {
    toCreate,
    toUpdate,
  };
}

/**
 * Converts an availability to a list of time intervals
 */
function convertAvailabilityToIntervals(
  availability: ProfessionalAvailability,
  missionDtstart: Date,
  missionUntil: Date
): TimeInterval[] {
  const intervals: TimeInterval[] = [];

  // Generate availability occurrences
  const occurrences = generateAvailabilityOccurrences(
    availability,
    missionDtstart,
    missionUntil
  );

  // Convert each occurrence to an interval
  for (const occ of occurrences) {
    const end = new Date(occ.getTime() + availability.duration_mn * 60 * 1000);
    intervals.push({
      end,
      originalPattern: {
        duration_mn: availability.duration_mn,
        rrule: availability.rrule,
      },
      start: occ,
    });
  }

  return intervals;
}

/**
 * Creates an availability RRULE for the full pattern after the schedule period ends.
 */
function createAvailabilityAfterSchedulePeriod(
  originalOptions: Partial<Options>,
  originalDtstart: Date,
  scheduleUntil: Date,
  originalUntil: Date | null | undefined
): string {
  // Find the next occurrence after schedule until
  const scheduleUntilPlusOne = new Date(scheduleUntil);
  scheduleUntilPlusOne.setSeconds(scheduleUntilPlusOne.getSeconds() + 1);
  const tempRule = new RRule({
    ...originalOptions,
    dtstart: originalDtstart,
  });
  const nextOccurrence = tempRule.after(scheduleUntilPlusOne, true);
  const finalDtstart = nextOccurrence || originalDtstart;

  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart: finalDtstart,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    until: originalUntil || undefined,
  };

  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Creates an availability RRULE with a new UNTIL date.
 */
function createAvailabilityWithUntil(
  originalOptions: Partial<Options>,
  until: Date
): string {
  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart: originalOptions.dtstart,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    until,
  };

  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Creates an RRULE from a group of intervals
 */
function createRRULEForIntervals(
  intervals: TimeInterval[],
  scheduleDtstart: Date,
  scheduleUntil: Date,
  originalOptions: Partial<Options>
): null | string {
  if (intervals.length === 0) {
    return null;
  }

  // Use the first interval to determine the time pattern
  const firstInterval = intervals[0];
  const hour = firstInterval.start.getUTCHours();
  const minute = firstInterval.start.getUTCMinutes();

  // Set dtstart to scheduleDtstart with the time from the interval
  const dtstart = new Date(scheduleDtstart);
  dtstart.setUTCHours(hour, minute, 0, 0);

  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    until: scheduleUntil,
  };

  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Extracts dtstart and until from a schedule RRULE.
 */
function extractScheduleDates(
  scheduleRrule: string,
  missionDtstart: Date,
  missionUntil: Date
): { dtstart: Date; until: Date } {
  const rule = rrulestr(scheduleRrule);

  let scheduleDtstart: Date = missionDtstart;
  let scheduleUntil: Date = missionUntil;

  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRuleSet;
    const rules = rruleSet.rrules();
    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleDtstart = firstRule.options.dtstart || missionDtstart;
      scheduleUntil =
        firstRule.options.until !== undefined &&
        firstRule.options.until !== null
          ? firstRule.options.until
          : missionUntil;
    }
  } else {
    const rrule = rule as RRule;
    scheduleDtstart = rrule.options.dtstart || missionDtstart;
    scheduleUntil =
      rrule.options.until !== undefined && rrule.options.until !== null
        ? rrule.options.until
        : missionUntil;
  }

  return { dtstart: scheduleDtstart, until: scheduleUntil };
}

/**
 * Finds the earliest schedule dtstart that affects an availability
 */
function findEarliestScheduleDtstart(
  missionSchedules: MissionSchedule[],
  availability: ProfessionalAvailability,
  missionDtstart: Date,
  missionUntil: Date
): Date | null {
  let earliest: Date | null = null;

  for (const schedule of missionSchedules) {
    const scheduleDates = extractScheduleDates(
      schedule.rrule,
      missionDtstart,
      missionUntil
    );
    const missionOccurrences = generateMissionOccurrences(
      schedule,
      missionDtstart,
      missionUntil
    );
    const availabilityOccurrences = generateAvailabilityOccurrences(
      availability,
      missionDtstart,
      missionUntil
    );

    // Check if any mission occurrence overlaps with any availability occurrence
    for (const missionOcc of missionOccurrences) {
      const missionEnd = new Date(
        missionOcc.getTime() + schedule.duration_mn * 60 * 1000
      );
      for (const availOcc of availabilityOccurrences) {
        const availEnd = new Date(
          availOcc.getTime() + availability.duration_mn * 60 * 1000
        );
        if (
          missionOcc.getTime() < availEnd.getTime() &&
          missionEnd.getTime() > availOcc.getTime()
        ) {
          if (!earliest || scheduleDates.dtstart < earliest) {
            earliest = scheduleDates.dtstart;
          }
          break;
        }
      }
    }
  }

  return earliest;
}

/**
 * Generates all occurrences for a professional availability.
 */
function generateAvailabilityOccurrences(
  availability: ProfessionalAvailability,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const rule = rrulestr(availability.rrule);

  let availabilityStart: Date | null = null;
  let availabilityUntil: Date | null = null;

  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRuleSet;
    const rules = rruleSet.rrules();
    if (rules.length > 0) {
      const firstRule = rules[0];
      availabilityStart = firstRule.options.dtstart || null;
      availabilityUntil = firstRule.options.until || null;
    }
  } else {
    const rrule = rule as RRule;
    availabilityStart = rrule.options.dtstart || null;
    availabilityUntil = rrule.options.until || null;
  }

  const effectiveStart = availabilityStart
    ? availabilityStart < missionDtstart
      ? availabilityStart
      : missionDtstart
    : missionDtstart;

  const effectiveUntil =
    availabilityUntil && availabilityUntil > missionUntil
      ? availabilityUntil
      : availabilityUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  return rule.between(effectiveStart, effectiveUntil, true);
}

/**
 * Generates all occurrences for a mission schedule within the mission date range.
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const rule = rrulestr(schedule.rrule);

  let scheduleStart: Date = missionDtstart;
  let scheduleUntil: Date = missionUntil;

  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRuleSet;
    const rules = rruleSet.rrules();
    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleStart = firstRule.options.dtstart || missionDtstart;
      scheduleUntil = firstRule.options.until || missionUntil;
    }
  } else {
    const rrule = rule as RRule;
    scheduleStart = rrule.options.dtstart || missionDtstart;
    scheduleUntil = rrule.options.until || missionUntil;
  }

  return rule.between(scheduleStart, scheduleUntil, true);
}

/**
 * Gets the base RRule from a parsed rule (handles RRuleSet)
 */
function getBaseRule(rule: RRule | RRuleSet): RRule {
  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRuleSet;
    const rules = rruleSet.rrules();
    return rules[0] || new RRule();
  }
  return rule as RRule;
}

/**
 * Groups intervals by period: before schedule, during schedule, after schedule
 */
function groupIntervalsByPeriod(
  intervals: TimeInterval[],
  missionSchedules: MissionSchedule[],
  missionDtstart: Date,
  missionUntil: Date
): {
  afterSchedule: TimeInterval[];
  beforeSchedule: TimeInterval[];
  duringSchedule: TimeInterval[];
  earliestScheduleDtstart: Date | null;
  latestScheduleUntil: Date | null;
} {
  // Find the earliest schedule dtstart and latest schedule until
  let earliestScheduleDtstart: Date | null = null;
  let latestScheduleUntil: Date | null = null;

  for (const schedule of missionSchedules) {
    const scheduleDates = extractScheduleDates(
      schedule.rrule,
      missionDtstart,
      missionUntil
    );
    if (
      !earliestScheduleDtstart ||
      scheduleDates.dtstart < earliestScheduleDtstart
    ) {
      earliestScheduleDtstart = scheduleDates.dtstart;
    }
    if (!latestScheduleUntil || scheduleDates.until > latestScheduleUntil) {
      latestScheduleUntil = scheduleDates.until;
    }
  }

  const beforeSchedule: TimeInterval[] = [];
  const duringSchedule: TimeInterval[] = [];
  const afterSchedule: TimeInterval[] = [];

  for (const interval of intervals) {
    // An interval is "before schedule" if it ends before the earliest schedule dtstart
    if (
      earliestScheduleDtstart &&
      interval.end.getTime() < earliestScheduleDtstart.getTime()
    ) {
      beforeSchedule.push(interval);
    }
    // An interval is "after schedule" if it starts after the latest schedule until
    else if (
      latestScheduleUntil &&
      interval.start.getTime() > latestScheduleUntil.getTime()
    ) {
      afterSchedule.push(interval);
    }
    // An interval is "during schedule" if it overlaps with the schedule period
    // Overlap: interval.start < scheduleUntil AND interval.end > scheduleDtstart
    else if (
      earliestScheduleDtstart &&
      latestScheduleUntil &&
      interval.start.getTime() < latestScheduleUntil.getTime() &&
      interval.end.getTime() > earliestScheduleDtstart.getTime()
    ) {
      duringSchedule.push(interval);
    }
  }

  return {
    afterSchedule,
    beforeSchedule,
    duringSchedule,
    earliestScheduleDtstart,
    latestScheduleUntil,
  };
}

/**
 * Groups intervals by their time pattern (hour and minute)
 */
function groupIntervalsByTimePattern(
  intervals: TimeInterval[]
): Map<string, TimeInterval[]> {
  const grouped = new Map<string, TimeInterval[]>();

  for (const interval of intervals) {
    const hour = interval.start.getUTCHours();
    const minute = interval.start.getUTCMinutes();
    const key = `${hour}:${minute}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(interval);
  }

  return grouped;
}

/**
 * Processes grouped intervals and creates/updates availabilities
 */
function processGroupedIntervals(
  grouped: {
    afterSchedule: TimeInterval[];
    beforeSchedule: TimeInterval[];
    duringSchedule: TimeInterval[];
    earliestScheduleDtstart: Date | null;
    latestScheduleUntil: Date | null;
  },
  originalAvailability: ProfessionalAvailability,
  missionSchedules: MissionSchedule[],
  missionDtstart: Date,
  missionUntil: Date,
  toUpdate: AvailabilityToUpdate[],
  toCreate: AvailabilityToCreate[]
): void {
  const originalRule = rrulestr(originalAvailability.rrule);
  const baseRule = getBaseRule(originalRule);
  const options = baseRule.options;

  // Update original availability to stop before earliest schedule dtstart
  if (grouped.earliestScheduleDtstart) {
    const untilBeforeSchedule = new Date(grouped.earliestScheduleDtstart);
    untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeSchedule
    );
    toUpdate.push({
      newRrule: updatedRrule,
      originalAvailability,
    });
  }

  // Create availabilities for intervals during schedule period
  if (
    grouped.duringSchedule.length > 0 &&
    grouped.earliestScheduleDtstart &&
    grouped.latestScheduleUntil
  ) {
    // Group by time pattern (hour/minute) to create RRULEs
    const intervalsByTime = groupIntervalsByTimePattern(grouped.duringSchedule);

    // Sort by time pattern to ensure consistent ordering (earlier times first)
    const sortedTimePatterns = Array.from(intervalsByTime.entries()).sort(
      ([a], [b]) => {
        const [aHour, aMin] = a.split(':').map(Number);
        const [bHour, bMin] = b.split(':').map(Number);
        if (aHour !== bHour) return aHour - bHour;
        return aMin - bMin;
      }
    );

    for (const [, intervals] of sortedTimePatterns) {
      const durationMn = intervals[0]
        ? Math.round(
            (intervals[0].end.getTime() - intervals[0].start.getTime()) /
              (60 * 1000)
          )
        : originalAvailability.duration_mn;

      // Create RRULE for this time pattern during schedule period
      const rrule = createRRULEForIntervals(
        intervals,
        grouped.earliestScheduleDtstart,
        grouped.latestScheduleUntil,
        options
      );

      if (rrule) {
        toCreate.push({
          duration_mn: durationMn,
          rrule,
        });
      }
    }
  }

  // Create post-mission availability from after-schedule intervals
  if (grouped.afterSchedule.length > 0 && grouped.latestScheduleUntil) {
    // For post-mission, we want to preserve the original pattern
    // So we create one RRULE starting after latest schedule until
    const postMissionRrule = createAvailabilityAfterSchedulePeriod(
      options,
      baseRule.options.dtstart || new Date(),
      grouped.latestScheduleUntil,
      options.until
    );

    toCreate.push({
      duration_mn: originalAvailability.duration_mn,
      rrule: postMissionRrule,
    });
  }
}

/**
 * Subtracts mission intervals from availability intervals
 * Returns the remaining intervals after subtraction
 */
function subtractIntervals(
  availabilityIntervals: TimeInterval[],
  missionIntervals: TimeInterval[]
): TimeInterval[] {
  const remaining: TimeInterval[] = [];

  for (const availInterval of availabilityIntervals) {
    let currentStart = availInterval.start;
    const availEnd = availInterval.end;

    // Find all mission intervals that overlap with this availability interval
    const overlappingMissions = missionIntervals.filter(
      mission =>
        mission.start.getTime() < availEnd.getTime() &&
        mission.end.getTime() > currentStart.getTime()
    );

    if (overlappingMissions.length === 0) {
      // No overlap - keep the entire interval
      remaining.push({
        end: availEnd,
        originalPattern: availInterval.originalPattern,
        start: currentStart,
      });
      continue;
    }

    // Sort overlapping missions by start time
    overlappingMissions.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Process each mission, creating intervals for the gaps
    for (const mission of overlappingMissions) {
      // If there's a gap before the mission, add it
      if (mission.start.getTime() > currentStart.getTime()) {
        remaining.push({
          end: mission.start,
          originalPattern: availInterval.originalPattern,
          start: currentStart,
        });
      }

      // Move current start to after the mission
      currentStart = new Date(
        Math.max(currentStart.getTime(), mission.end.getTime())
      );
    }

    // If there's a gap after the last mission, add it
    if (currentStart.getTime() < availEnd.getTime()) {
      remaining.push({
        end: availEnd,
        originalPattern: availInterval.originalPattern,
        start: currentStart,
      });
    }
  }

  return remaining;
}
