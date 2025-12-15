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
 * Calculates how an availability should be modified when a mission overlaps with it.
 */
interface AvailabilityModifications {
  needsCreate: boolean;
  needsUpdate: boolean;
  newDurationMn?: number;
  newRrule?: string;
  postMissionDurationMn?: number;
  postMissionRrule?: string;
  updatedDurationMn?: number;
  updatedRrule?: string;
}

/**
 * Calculates which professional availabilities need to be updated or created
 * to block out mission periods.
 *
 * When a mission is scheduled, the professional's availabilities that correspond
 * to the mission schedules should become unavailable during the mission period.
 *
 * This function:
 * 1. Takes professional availabilities and missions with their schedules
 * 2. For each mission schedule occurrence, finds corresponding availability occurrences
 * 3. Determines which availabilities need to be split, truncated, or modified
 * 4. Returns availabilities that need to be updated and new ones that need to be created
 *
 * Post-Mission Period Handling:
 * When a mission is in the middle of an availability, the function creates TWO new availabilities:
 * - During Mission: Covers the "after mission" part (e.g., 11am-12pm) but only during the mission
 *   period (with UNTIL = mission end)
 * - After Mission: Resumes the full availability pattern (e.g., 9am-12pm) starting after the mission
 *   period ends, preserving the original UNTIL if it existed
 *
 * Important:
 * - Only the RRULE string is used as the source of truth for availabilities and mission schedules.
 *   Any dtstart/until columns in the database are ignored - dates are extracted from parsing the RRULE.
 * - For missions, missionDtstart and missionUntil parameters (from the missions table) are used safely.
 *
 * Note: This function assumes all mission schedules have been validated and are
 * within professional availabilities (via validateMissionAvailability).
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

  // Track which availabilities have been processed to avoid duplicates
  const processedAvailabilityIndices = new Set<number>();

  // Generate all mission occurrences
  for (const schedule of missionSchedules) {
    const missionOccurrences = generateMissionOccurrences(
      schedule,
      missionDtstart,
      missionUntil
    );

    // For each mission occurrence, find overlapping availability occurrences
    for (const missionOcc of missionOccurrences) {
      const missionEnd = new Date(
        missionOcc.getTime() + schedule.duration_mn * 60 * 1000
      );

      // Check each availability
      for (
        let availIndex = 0;
        availIndex < availabilities.length;
        availIndex++
      ) {
        if (processedAvailabilityIndices.has(availIndex)) {
          continue;
        }

        const availability = availabilities[availIndex];
        const availabilityOccurrences = generateAvailabilityOccurrences(
          availability,
          missionDtstart,
          missionUntil
        );

        // Find availability occurrences that overlap with this mission occurrence
        for (const availOcc of availabilityOccurrences) {
          const availEnd = new Date(
            availOcc.getTime() + availability.duration_mn * 60 * 1000
          );

          // Check if mission overlaps with this availability occurrence
          if (
            missionOcc.getTime() < availEnd.getTime() &&
            missionEnd.getTime() > availOcc.getTime()
          ) {
            // Mission overlaps with this availability occurrence
            // Determine how to modify the availability
            const modifications = calculateAvailabilityModifications(
              availability,
              missionOcc,
              missionEnd,
              availOcc,
              availEnd,
              missionUntil
            );

            if (modifications.needsUpdate && modifications.updatedRrule) {
              // Check if we already have an update for this availability
              const existingUpdate = toUpdate.find(
                u => u.originalAvailability === availability
              );

              if (!existingUpdate) {
                toUpdate.push({
                  newDurationMn: modifications.updatedDurationMn,
                  newRrule: modifications.updatedRrule,
                  originalAvailability: availability,
                });
              }
            }

            if (
              modifications.needsCreate &&
              modifications.newRrule &&
              modifications.newDurationMn !== undefined
            ) {
              toCreate.push({
                duration_mn: modifications.newDurationMn,
                rrule: modifications.newRrule,
              });
            }

            // Handle post-mission availability (for mission in the middle case)
            if (
              modifications.postMissionRrule &&
              modifications.postMissionDurationMn !== undefined
            ) {
              toCreate.push({
                duration_mn: modifications.postMissionDurationMn,
                rrule: modifications.postMissionRrule,
              });
            }

            processedAvailabilityIndices.add(availIndex);
            break; // Process each availability only once per mission occurrence
          }
        }
      }
    }
  }

  return {
    toCreate,
    toUpdate,
  };
}

function calculateAvailabilityModifications(
  availability: ProfessionalAvailability,
  missionStart: Date,
  missionEnd: Date,
  availStart: Date,
  availEnd: Date,
  missionUntil: Date
): AvailabilityModifications {
  const result: AvailabilityModifications = {
    needsCreate: false,
    needsUpdate: false,
  };

  // Parse the original availability RRULE
  const originalRule = rrulestr(availability.rrule);
  const isRRuleSet =
    originalRule instanceof RRuleSet ||
    typeof (originalRule as RRuleSet).rrules === 'function';

  let baseRule: RRule;
  if (isRRuleSet) {
    const rruleSet = originalRule as RRuleSet;
    const rules = rruleSet.rrules();
    baseRule = rules[0] || new RRule();
  } else {
    baseRule = originalRule as RRule;
  }

  const options = baseRule.options;

  // Calculate time differences
  const missionStartTime = missionStart.getTime();
  const missionEndTime = missionEnd.getTime();
  const availStartTime = availStart.getTime();
  const availEndTime = availEnd.getTime();

  // Case 1: Mission is at the start of availability
  // Create new availability starting after mission
  if (
    Math.abs(missionStartTime - availStartTime) < 60000 &&
    missionEndTime < availEndTime
  ) {
    const newDurationMn = (availEndTime - missionEndTime) / (60 * 1000);
    const newRrule = createAvailabilityAfterMission(
      options,
      missionEnd,
      options.until
    );

    result.needsCreate = true;
    result.newRrule = newRrule;
    result.newDurationMn = newDurationMn;

    // Update original to end before mission (set UNTIL to just before mission start)
    const untilBeforeMission = new Date(missionStart);
    untilBeforeMission.setSeconds(untilBeforeMission.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeMission
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;
  }
  // Case 2: Mission is at the end of availability
  // Update availability to end before mission
  else if (
    missionStartTime > availStartTime &&
    Math.abs(missionEndTime - availEndTime) < 60000
  ) {
    const untilBeforeMission = new Date(missionStart);
    untilBeforeMission.setSeconds(untilBeforeMission.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeMission
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;
  }
  // Case 3: Mission is in the middle of availability
  // Split into three parts:
  // 1. Original availability stops before mission (9am-10am, UNTIL = just before first mission)
  // 2. Create availability for "after mission" part during mission period (11am-12pm, UNTIL = mission end)
  // 3. Create availability for full pattern after mission ends (9am-12pm, no UNTIL - resumes full availability)
  else if (missionStartTime > availStartTime && missionEndTime < availEndTime) {
    // 1. Update original to end before mission
    const untilBeforeMission = new Date(missionStart);
    untilBeforeMission.setSeconds(untilBeforeMission.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeMission
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;

    // 2. Create availability for "after mission" part during mission period
    // This covers the time after mission (e.g., 11am-12pm) but only during the mission period
    const duringMissionDurationMn =
      (availEndTime - missionEndTime) / (60 * 1000);
    const duringMissionRrule = createAvailabilityDuringMission(
      options,
      missionEnd,
      missionUntil
    );

    result.needsCreate = true;
    result.newRrule = duringMissionRrule;
    result.newDurationMn = duringMissionDurationMn;

    // 3. Create availability for full pattern after mission ends
    // This resumes the complete availability (e.g., 9am-12pm) after the mission period
    const postMissionRrule = createAvailabilityAfterMissionPeriod(
      options,
      availStart,
      missionUntil,
      options.until
    );

    result.postMissionRrule = postMissionRrule;
    result.postMissionDurationMn = availability.duration_mn;
  }
  // Case 4: Mission covers entire availability
  // Set UNTIL to just before mission start
  else if (
    Math.abs(missionStartTime - availStartTime) < 60000 &&
    Math.abs(missionEndTime - availEndTime) < 60000
  ) {
    const untilBeforeMission = new Date(missionStart);
    untilBeforeMission.setSeconds(untilBeforeMission.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeMission
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;
  }

  return result;
}

/**
 * Creates a new availability RRULE that starts after a mission ends.
 * Preserves the original availability's UNTIL if it had one, otherwise continues indefinitely.
 */
function createAvailabilityAfterMission(
  originalOptions: Partial<Options>,
  missionEnd: Date,
  originalUntil: Date | null | undefined
): string {
  // Create new options, preserving the original UNTIL if it existed
  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart: missionEnd,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    // Preserve original UNTIL if it existed, otherwise continue indefinitely
    until: originalUntil || undefined,
  };

  // Remove count if present (we're using UNTIL if it exists)
  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Creates an availability RRULE for the full pattern after the mission period ends.
 * This resumes the complete availability (e.g., 9am-12pm) after the mission ends.
 * Preserves the original availability's UNTIL if it had one, otherwise continues indefinitely.
 */
function createAvailabilityAfterMissionPeriod(
  originalOptions: Partial<Options>,
  originalDtstart: Date,
  missionUntil: Date,
  originalUntil: Date | null | undefined
): string {
  // Calculate the first occurrence after mission ends
  // We need to find the next occurrence of the pattern after missionUntil
  // For simplicity, we'll use the original DTSTART time but on the first occurrence after mission
  const firstOccurrenceAfterMission = new Date(missionUntil);
  firstOccurrenceAfterMission.setDate(
    firstOccurrenceAfterMission.getDate() + 1
  );
  // Set the time to match the original DTSTART time
  firstOccurrenceAfterMission.setUTCHours(
    originalDtstart.getUTCHours(),
    originalDtstart.getUTCMinutes(),
    originalDtstart.getUTCSeconds(),
    0
  );

  // If the pattern is weekly, find the next matching weekday
  if (originalOptions.freq === RRule.WEEKLY && originalOptions.byweekday) {
    // Find the next occurrence that matches the pattern
    const tempRule = new RRule({
      ...originalOptions,
      dtstart: originalDtstart,
    });
    const nextOccurrences = tempRule.after(missionUntil, true);
    if (nextOccurrences) {
      firstOccurrenceAfterMission.setTime(nextOccurrences.getTime());
    }
  } else {
    // For other frequencies, use the temp rule to find next occurrence
    const tempRule = new RRule({
      ...originalOptions,
      dtstart: originalDtstart,
    });
    const nextOccurrences = tempRule.after(missionUntil, true);
    if (nextOccurrences) {
      firstOccurrenceAfterMission.setTime(nextOccurrences.getTime());
    }
  }

  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart: firstOccurrenceAfterMission,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    // Preserve original UNTIL if it existed, otherwise continue indefinitely
    until: originalUntil || undefined,
  };

  // Remove count if present (we're using UNTIL if it exists)
  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Creates an availability RRULE for the "after mission" part during the mission period.
 * This availability only exists during the mission period (UNTIL = mission end).
 * Example: If original is 9am-12pm and mission is 10am-11am, this creates 11am-12pm
 * that only recurs during the mission period.
 */
function createAvailabilityDuringMission(
  originalOptions: Partial<Options>,
  missionEnd: Date,
  missionUntil: Date
): string {
  const newOptions: Partial<Options> = {
    bymonth: originalOptions.bymonth,
    bymonthday: originalOptions.bymonthday,
    bysetpos: originalOptions.bysetpos,
    byweekday: originalOptions.byweekday,
    byweekno: originalOptions.byweekno,
    byyearday: originalOptions.byyearday,
    dtstart: missionEnd,
    freq: originalOptions.freq,
    interval: originalOptions.interval,
    // Set UNTIL to mission end - this availability only exists during mission period
    until: missionUntil,
  };

  // Remove count if present (we're using UNTIL instead)
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
    ...originalOptions,
    until,
  };

  // Remove count if present (we're using UNTIL instead)
  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Generates all occurrences for a professional availability.
 * Only uses the RRULE string - extracts dtstart/until from parsing the RRULE, not from database columns.
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
 * Only uses the RRULE string - extracts dtstart/until from parsing the RRULE, not from database columns.
 * Uses missionDtstart and missionUntil parameters from the missions table.
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const rule = rrulestr(schedule.rrule);

  // Get the effective date range
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
