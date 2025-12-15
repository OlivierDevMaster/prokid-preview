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
 * Note: This function assumes all mission schedules have been validated and are
 * within professional availabilities (via validateMissionAvailability).
 *
 * @param availabilities - Array of professional availabilities with RRULE and duration
 * @param missionSchedules - Array of mission schedules with RRULE and duration
 * @param missionDtstart - Mission start date
 * @param missionUntil - Mission end date
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
              availEnd
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
  availEnd: Date
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
  // Split into two: before mission and after mission
  else if (missionStartTime > availStartTime && missionEndTime < availEndTime) {
    // Create availability after mission
    const newDurationMn = (availEndTime - missionEndTime) / (60 * 1000);
    const newRrule = createAvailabilityAfterMission(
      options,
      missionEnd,
      options.until
    );

    result.needsCreate = true;
    result.newRrule = newRrule;
    result.newDurationMn = newDurationMn;

    // Update original to end before mission
    const untilBeforeMission = new Date(missionStart);
    untilBeforeMission.setSeconds(untilBeforeMission.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeMission
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;
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
