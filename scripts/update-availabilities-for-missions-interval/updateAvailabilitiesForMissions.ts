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
  // Schedule information for intervals during schedule period
  scheduleInfo?: {
    // Whether this interval is "after mission" or "before mission"
    isAfterMission?: boolean;
    isBeforeMission?: boolean;
    schedule: MissionSchedule;
    scheduleDtstart: Date;
    scheduleUntil: Date;
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

  // Step 1: Convert all mission schedules to intervals with schedule info
  const missionIntervalsWithSchedule: Array<{
    interval: TimeInterval;
    schedule: MissionSchedule;
    scheduleDtstart: Date;
    scheduleUntil: Date;
  }> = [];
  for (const schedule of missionSchedules) {
    const scheduleDates = extractScheduleDates(
      schedule.rrule,
      missionDtstart,
      missionUntil
    );
    const scheduleDtstart = scheduleDates.dtstart;
    const scheduleUntil = scheduleDates.until;

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
      missionIntervalsWithSchedule.push({
        interval: {
          end: missionEnd,
          start: missionOcc,
        },
        schedule,
        scheduleDtstart,
        scheduleUntil,
      });
    }
  }

  // Sort mission intervals by start time for efficient processing
  missionIntervalsWithSchedule.sort(
    (a, b) => a.interval.start.getTime() - b.interval.start.getTime()
  );

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

    // Step 3: For each schedule, create "before mission" and "after mission" intervals
    // This ensures we create separate parts for each schedule, even when they overlap
    const scheduleSpecificIntervals: TimeInterval[] = [];

    // Group mission intervals by schedule
    const missionsBySchedule = new Map<
      string,
      Array<{
        interval: TimeInterval;
        schedule: MissionSchedule;
        scheduleDtstart: Date;
        scheduleUntil: Date;
      }>
    >();

    for (const missionData of missionIntervalsWithSchedule) {
      const scheduleKey = missionData.schedule.rrule;
      if (!missionsBySchedule.has(scheduleKey)) {
        missionsBySchedule.set(scheduleKey, []);
      }
      missionsBySchedule.get(scheduleKey)!.push(missionData);
    }

    // For each schedule, create "before" and "after" intervals
    for (const [, scheduleMissions] of missionsBySchedule.entries()) {
      const { schedule, scheduleDtstart, scheduleUntil } = scheduleMissions[0];

      // Find availability intervals that overlap with this schedule's missions
      for (const availInterval of availabilityIntervals) {
        const overlappingMissions = scheduleMissions.filter(
          ({ interval: mission }) =>
            mission.start.getTime() < availInterval.end.getTime() &&
            mission.end.getTime() > availInterval.start.getTime()
        );

        if (overlappingMissions.length > 0) {
          // Sort by start time
          overlappingMissions.sort(
            (a, b) => a.interval.start.getTime() - b.interval.start.getTime()
          );

          const firstMission = overlappingMissions[0];
          const lastMission =
            overlappingMissions[overlappingMissions.length - 1];

          // Create "before mission" interval if mission doesn't start at availability start
          if (
            firstMission.interval.start.getTime() >
            availInterval.start.getTime()
          ) {
            scheduleSpecificIntervals.push({
              end: firstMission.interval.start,
              originalPattern: availInterval.originalPattern,
              scheduleInfo: {
                isBeforeMission: true,
                schedule,
                scheduleDtstart,
                scheduleUntil,
              },
              start: availInterval.start,
            });
          }

          // Create "after mission" interval if mission doesn't end at availability end
          if (
            lastMission.interval.end.getTime() < availInterval.end.getTime()
          ) {
            scheduleSpecificIntervals.push({
              end: availInterval.end,
              originalPattern: availInterval.originalPattern,
              scheduleInfo: {
                isAfterMission: true,
                schedule,
                scheduleDtstart,
                scheduleUntil,
              },
              start: lastMission.interval.end,
            });
          }
        }
      }
    }

    // Step 4: Also subtract all missions to get remaining intervals (for post-mission)
    const remainingIntervals = subtractIntervalsWithScheduleInfo(
      availabilityIntervals,
      missionIntervalsWithSchedule
    );

    // Combine schedule-specific intervals with remaining intervals
    // Remove duplicates (intervals that appear in both)
    const allIntervals = [...scheduleSpecificIntervals];
    for (const remaining of remainingIntervals) {
      // Only add if it doesn't have scheduleInfo (post-mission intervals)
      // or if it's not already covered by schedule-specific intervals
      if (!remaining.scheduleInfo) {
        allIntervals.push(remaining);
      }
    }

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

    // Step 5: Group all intervals and create/update availabilities
    const groupedIntervals = groupIntervalsByPeriod(
      allIntervals,
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
    // An interval is "during schedule" if it has scheduleInfo (it was created from a mission overlap)
    if (interval.scheduleInfo) {
      duringSchedule.push(interval);
    }
    // An interval is "before schedule" if it ends before the earliest schedule dtstart
    else if (
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
    // Group intervals by schedule (for "before mission" and "after mission" parts)
    // Use schedule rrule as key since object comparison doesn't work
    const intervalsBySchedule = new Map<
      string,
      {
        after: TimeInterval[];
        before: TimeInterval[];
        schedule: MissionSchedule;
        scheduleDates: { dtstart: Date; until: Date };
      }
    >();

    for (const interval of grouped.duringSchedule) {
      if (interval.scheduleInfo) {
        const { schedule, scheduleDtstart, scheduleUntil } =
          interval.scheduleInfo;
        const scheduleKey = schedule.rrule;
        if (!intervalsBySchedule.has(scheduleKey)) {
          intervalsBySchedule.set(scheduleKey, {
            after: [],
            before: [],
            schedule,
            scheduleDates: { dtstart: scheduleDtstart, until: scheduleUntil },
          });
        }
        const scheduleIntervals = intervalsBySchedule.get(scheduleKey)!;

        // Use the flags set when creating the interval
        if (interval.scheduleInfo?.isBeforeMission) {
          scheduleIntervals.before.push(interval);
        } else if (interval.scheduleInfo?.isAfterMission) {
          scheduleIntervals.after.push(interval);
        }
      }
    }

    // Create "before mission" and "after mission" parts for each schedule
    for (const [, scheduleIntervals] of intervalsBySchedule.entries()) {
      const scheduleDates = scheduleIntervals.scheduleDates;

      // Create "before mission" parts
      if (scheduleIntervals.before.length > 0) {
        const intervalsByTime = groupIntervalsByTimePattern(
          scheduleIntervals.before
        );
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

          const rrule = createRRULEForIntervals(
            intervals,
            scheduleDates.dtstart,
            scheduleDates.until,
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

      // Create "after mission" parts
      if (scheduleIntervals.after.length > 0) {
        const intervalsByTime = groupIntervalsByTimePattern(
          scheduleIntervals.after
        );
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

          const rrule = createRRULEForIntervals(
            intervals,
            scheduleDates.dtstart,
            scheduleDates.until,
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
    }

    // Also handle intervals without schedule info (fallback - should be rare)
    // Only process if we didn't process any intervals with scheduleInfo
    if (intervalsBySchedule.size === 0) {
      const intervalsWithoutSchedule = grouped.duringSchedule.filter(
        i => !i.scheduleInfo
      );
      if (intervalsWithoutSchedule.length > 0) {
        const intervalsByTime = groupIntervalsByTimePattern(
          intervalsWithoutSchedule
        );
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

          const rrule = createRRULEForIntervals(
            intervals,
            grouped.earliestScheduleDtstart!,
            grouped.latestScheduleUntil!,
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
 * Subtracts mission intervals from availability intervals, tracking schedule info
 * Returns the remaining intervals after subtraction with schedule information
 */
function subtractIntervalsWithScheduleInfo(
  availabilityIntervals: TimeInterval[],
  missionIntervalsWithSchedule: Array<{
    interval: TimeInterval;
    schedule: MissionSchedule;
    scheduleDtstart: Date;
    scheduleUntil: Date;
  }>
): TimeInterval[] {
  const remaining: TimeInterval[] = [];

  for (const availInterval of availabilityIntervals) {
    let currentStart = availInterval.start;
    const availEnd = availInterval.end;

    // Find all mission intervals that overlap with this availability interval
    const overlappingMissions = missionIntervalsWithSchedule.filter(
      ({ interval: mission }) =>
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
    overlappingMissions.sort(
      (a, b) => a.interval.start.getTime() - b.interval.start.getTime()
    );

    // Process each mission, creating intervals for the gaps
    for (const {
      interval: mission,
      schedule,
      scheduleDtstart,
      scheduleUntil,
    } of overlappingMissions) {
      // If there's a gap before the mission, add it with schedule info (marked as "before mission")
      if (mission.start.getTime() > currentStart.getTime()) {
        remaining.push({
          end: mission.start,
          originalPattern: availInterval.originalPattern,
          scheduleInfo: {
            isBeforeMission: true,
            schedule,
            scheduleDtstart,
            scheduleUntil,
          },
          start: currentStart,
        });
      }

      // Move current start to after the mission
      currentStart = new Date(
        Math.max(currentStart.getTime(), mission.end.getTime())
      );

      // If there's a gap after the mission (within the same availability), add it with schedule info (marked as "after mission")
      if (
        mission.end.getTime() < availEnd.getTime() &&
        currentStart.getTime() < availEnd.getTime()
      ) {
        remaining.push({
          end: availEnd,
          originalPattern: availInterval.originalPattern,
          scheduleInfo: {
            isAfterMission: true,
            schedule,
            scheduleDtstart,
            scheduleUntil,
          },
          start: currentStart,
        });
      }
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
