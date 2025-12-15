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
  afterMissionDurationMn?: number;
  afterMissionRrule?: string;
  beforeMissionDurationMn?: number;
  beforeMissionRrule?: string;
  needsCreate: boolean;
  needsUpdate: boolean;
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

  // Track schedule periods per availability to consolidate them
  // Map: availability index -> { earliestScheduleDtstart, latestScheduleUntil, schedules }
  const availabilityScheduleInfo = new Map<
    number,
    {
      earliestScheduleDtstart: Date;
      latestScheduleUntil: Date;
      schedules: Array<{
        availEnd: Date;
        availOcc: Date;
        missionEnd: Date;
        missionOcc: Date;
        schedule: MissionSchedule;
        scheduleDtstart: Date;
        scheduleUntil: Date;
      }>;
    }
  >();

  // First pass: collect all schedule periods that affect each availability
  for (const schedule of missionSchedules) {
    // Extract schedule's dtstart (A) and until (B) from the schedule RRULE
    const scheduleDates = extractScheduleDates(
      schedule.rrule,
      missionDtstart,
      missionUntil
    );
    const scheduleDtstart = scheduleDates.dtstart; // A
    const scheduleUntil = scheduleDates.until; // B

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
            // Track this schedule period for the availability
            if (!availabilityScheduleInfo.has(availIndex)) {
              availabilityScheduleInfo.set(availIndex, {
                earliestScheduleDtstart: scheduleDtstart,
                latestScheduleUntil: scheduleUntil,
                schedules: [],
              });
            }

            const info = availabilityScheduleInfo.get(availIndex)!;
            // Update earliest schedule dtstart (A)
            if (scheduleDtstart < info.earliestScheduleDtstart) {
              info.earliestScheduleDtstart = scheduleDtstart;
            }
            // Update latest schedule until (B)
            if (scheduleUntil > info.latestScheduleUntil) {
              info.latestScheduleUntil = scheduleUntil;
            }

            // Only add this schedule once per availability (use first occurrence)
            const scheduleAlreadyAdded = info.schedules.some(
              s => s.schedule === schedule
            );
            if (!scheduleAlreadyAdded) {
              info.schedules.push({
                availEnd,
                availOcc,
                missionEnd,
                missionOcc,
                schedule,
                scheduleDtstart,
                scheduleUntil,
              });
            }

            break; // Process each availability occurrence only once per mission occurrence
          }
        }
      }
    }
  }

  // Second pass: process each affected availability with consolidated schedule periods
  for (const [availIndex, scheduleInfo] of availabilityScheduleInfo.entries()) {
    const availability = availabilities[availIndex];
    const consolidatedScheduleDtstart = scheduleInfo.earliestScheduleDtstart;
    const consolidatedScheduleUntil = scheduleInfo.latestScheduleUntil;

    // Process each schedule that affects this availability
    // Use the consolidated dates (earliest A, latest B) for the main update
    // But process each schedule's specific parts individually
    for (const scheduleData of scheduleInfo.schedules) {
      const modifications = calculateAvailabilityModifications(
        availability,
        scheduleData.missionOcc,
        scheduleData.missionEnd,
        scheduleData.availOcc,
        scheduleData.availEnd,
        scheduleData.scheduleDtstart,
        scheduleData.scheduleUntil
      );

      // For the original update, use consolidated dates (earliest A)
      if (modifications.needsUpdate && modifications.updatedRrule) {
        // Check if we already have an update for this availability
        const existingUpdate = toUpdate.find(
          u => u.originalAvailability === availability
        );

        if (!existingUpdate) {
          // Use consolidated earliest schedule dtstart for the UNTIL
          const untilBeforeSchedule = new Date(consolidatedScheduleDtstart);
          untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);

          // Parse the original availability RRULE to get options
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

          const updatedRrule = createAvailabilityWithUntil(
            baseRule.options,
            untilBeforeSchedule
          );

          toUpdate.push({
            newDurationMn: modifications.updatedDurationMn,
            newRrule: updatedRrule,
            originalAvailability: availability,
          });
        }
      }

      // Handle "before mission" part during schedule period
      if (
        modifications.beforeMissionRrule &&
        modifications.beforeMissionDurationMn !== undefined
      ) {
        toCreate.push({
          duration_mn: modifications.beforeMissionDurationMn,
          rrule: modifications.beforeMissionRrule,
        });
      }

      // Handle "after mission" part during schedule period
      if (
        modifications.afterMissionRrule &&
        modifications.afterMissionDurationMn !== undefined
      ) {
        toCreate.push({
          duration_mn: modifications.afterMissionDurationMn,
          rrule: modifications.afterMissionRrule,
        });
      }
    }

    // Create post-mission availability using consolidated latest schedule until (B)
    // Only create once per availability, using the latest schedule until
    // Check if we already created a post-mission for this availability
    const existingPostMission = toCreate.some(
      created =>
        created.duration_mn === availability.duration_mn &&
        (() => {
          try {
            const rule = rrulestr(created.rrule);
            const ruleObj =
              rule instanceof RRuleSet
                ? (rule as RRuleSet).rrules()[0]
                : (rule as RRule);
            return (
              ruleObj.options.dtstart &&
              ruleObj.options.dtstart > consolidatedScheduleUntil
            );
          } catch {
            return false;
          }
        })()
    );

    if (!existingPostMission) {
      // Parse the original availability RRULE to get options
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

      // Get the original dtstart from the availability
      const originalDtstart = options.dtstart || new Date();

      // Create post-mission availability using consolidated latest schedule until (B)
      const postMissionRrule = createAvailabilityAfterSchedulePeriod(
        options,
        originalDtstart,
        consolidatedScheduleUntil,
        options.until
      );

      toCreate.push({
        duration_mn: availability.duration_mn,
        rrule: postMissionRrule,
      });
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
  scheduleDtstart: Date,
  scheduleUntil: Date
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
  // Pattern: Subtract schedule period, resume full availability after schedule ends
  // 1. Update original: UNTIL = scheduleDtstart (A) - just before first schedule occurrence
  // 2. Create "after mission" part: 10am-12pm, dtstart = A, until = B
  // 3. Create post-mission: 9am-12pm, dtstart = B, until = original until
  if (
    Math.abs(missionStartTime - availStartTime) < 60000 &&
    missionEndTime < availEndTime
  ) {
    // 1. Update original to end before first schedule occurrence (A)
    const untilBeforeSchedule = new Date(scheduleDtstart);
    untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeSchedule
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;

    // 2. Create "after mission" part during schedule period (10am-12pm, dtstart = A, until = B)
    const afterMissionDurationMn =
      (availEndTime - missionEndTime) / (60 * 1000);
    const afterMissionRrule = createAvailabilityForSchedulePeriod(
      options,
      missionEnd,
      scheduleDtstart,
      scheduleUntil
    );

    result.needsCreate = true;
    result.afterMissionRrule = afterMissionRrule;
    result.afterMissionDurationMn = afterMissionDurationMn;

    // 3. Create post-mission: full pattern (9am-12pm, dtstart = B, until = original until)
    const postMissionRrule = createAvailabilityAfterSchedulePeriod(
      options,
      availStart,
      scheduleUntil,
      options.until
    );

    result.postMissionRrule = postMissionRrule;
    result.postMissionDurationMn = availability.duration_mn;
  }
  // Case 2: Mission is at the end of availability
  // Pattern: Subtract schedule period, resume full availability after schedule ends
  // 1. Update original: UNTIL = scheduleDtstart (A) - just before first schedule occurrence
  // 2. Create "before mission" part: 9am-11am, dtstart = A, until = B
  // 3. Create post-mission: 9am-12pm, dtstart = B, until = original until
  else if (
    missionStartTime > availStartTime &&
    Math.abs(missionEndTime - availEndTime) < 60000
  ) {
    // 1. Update original to end before first schedule occurrence (A)
    const untilBeforeSchedule = new Date(scheduleDtstart);
    untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeSchedule
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;

    // 2. Create "before mission" part during schedule period (9am-11am, dtstart = A, until = B)
    const beforeMissionDurationMn =
      (missionStartTime - availStartTime) / (60 * 1000);
    const beforeMissionRrule = createAvailabilityForSchedulePeriod(
      options,
      availStart,
      scheduleDtstart,
      scheduleUntil
    );

    result.needsCreate = true;
    result.beforeMissionRrule = beforeMissionRrule;
    result.beforeMissionDurationMn = beforeMissionDurationMn;

    // 3. Create post-mission: full pattern (9am-12pm, dtstart = B, until = original until)
    const postMissionRrule = createAvailabilityAfterSchedulePeriod(
      options,
      availStart,
      scheduleUntil,
      options.until
    );

    result.postMissionRrule = postMissionRrule;
    result.postMissionDurationMn = availability.duration_mn;
  }
  // Case 3: Mission is in the middle of availability
  // Pattern: Subtract mission period, resume full availability after mission ends
  // 1. Update original: UNTIL = scheduleDtstart (A) - just before first schedule occurrence
  // 2. Create "before mission" part: 9am-10am, dtstart = A, until = B
  // 3. Create "after mission" part: 11am-12pm, dtstart = A, until = B
  // 4. Create post-mission: 9am-12pm, dtstart = B, until = original until
  else if (missionStartTime > availStartTime && missionEndTime < availEndTime) {
    // 1. Update original to end before first schedule occurrence (A)
    const untilBeforeSchedule = new Date(scheduleDtstart);
    untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeSchedule
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;

    // 2. Create "before mission" part during schedule period (9am-10am, dtstart = A, until = B)
    const beforeMissionDurationMn =
      (missionStartTime - availStartTime) / (60 * 1000);
    const beforeMissionRrule = createAvailabilityForSchedulePeriod(
      options,
      availStart,
      scheduleDtstart,
      scheduleUntil
    );

    result.needsCreate = true;
    result.beforeMissionRrule = beforeMissionRrule;
    result.beforeMissionDurationMn = beforeMissionDurationMn;

    // 3. Create "after mission" part during schedule period (11am-12pm, dtstart = A, until = B)
    const afterMissionDurationMn =
      (availEndTime - missionEndTime) / (60 * 1000);
    const afterMissionRrule = createAvailabilityForSchedulePeriod(
      options,
      missionEnd,
      scheduleDtstart,
      scheduleUntil
    );

    result.afterMissionRrule = afterMissionRrule;
    result.afterMissionDurationMn = afterMissionDurationMn;

    // 4. Create post-mission: full pattern (9am-12pm, dtstart = B, until = original until)
    const postMissionRrule = createAvailabilityAfterSchedulePeriod(
      options,
      availStart,
      scheduleUntil,
      options.until
    );

    result.postMissionRrule = postMissionRrule;
    result.postMissionDurationMn = availability.duration_mn;
  }
  // Case 4: Mission covers entire availability
  // Pattern: Subtract schedule period, resume full availability after schedule ends
  // 1. Update original: UNTIL = scheduleDtstart (A) - just before first schedule occurrence
  // 2. Create post-mission: 9am-12pm, dtstart = B, until = original until
  else if (
    Math.abs(missionStartTime - availStartTime) < 60000 &&
    Math.abs(missionEndTime - availEndTime) < 60000
  ) {
    // 1. Update original to end before first schedule occurrence (A)
    const untilBeforeSchedule = new Date(scheduleDtstart);
    untilBeforeSchedule.setSeconds(untilBeforeSchedule.getSeconds() - 1);
    const updatedRrule = createAvailabilityWithUntil(
      options,
      untilBeforeSchedule
    );

    result.needsUpdate = true;
    result.updatedRrule = updatedRrule;

    // 2. Create post-mission: full pattern (9am-12pm, dtstart = B, until = original until)
    const postMissionRrule = createAvailabilityAfterSchedulePeriod(
      options,
      availStart,
      scheduleUntil,
      options.until
    );

    result.postMissionRrule = postMissionRrule;
    result.postMissionDurationMn = availability.duration_mn;
  }

  return result;
}

/**
 * Creates an availability RRULE for the full pattern after the schedule period ends.
 * Uses the schedule's until (B) as the dtstart for the post-mission availability.
 * Preserves the original availability's UNTIL if it had one, otherwise continues indefinitely.
 */
function createAvailabilityAfterSchedulePeriod(
  originalOptions: Partial<Options>,
  originalDtstart: Date,
  scheduleUntil: Date,
  originalUntil: Date | null | undefined
): string {
  // Calculate the time of day from originalDtstart
  const hour = originalDtstart.getUTCHours();
  const minute = originalDtstart.getUTCMinutes();
  const second = originalDtstart.getUTCSeconds();

  // Set dtstart to scheduleUntil (B) but with the time from originalDtstart
  const dtstart = new Date(scheduleUntil);
  dtstart.setUTCHours(hour, minute, second, 0);

  // Find the next occurrence of the pattern after scheduleUntil (B)
  // Add 1 second to scheduleUntil to ensure we get the next occurrence after it ends
  const scheduleUntilPlusOne = new Date(scheduleUntil);
  scheduleUntilPlusOne.setSeconds(scheduleUntilPlusOne.getSeconds() + 1);
  const tempRule = new RRule({
    ...originalOptions,
    dtstart: originalDtstart,
  });
  const nextOccurrence = tempRule.after(scheduleUntilPlusOne, true);
  const finalDtstart = nextOccurrence || dtstart;

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
    // Preserve original UNTIL if it existed, otherwise continue indefinitely
    until: originalUntil || undefined,
  };

  // Remove count if present (we're using UNTIL if it exists)
  delete newOptions.count;

  const newRule = new RRule(newOptions);
  return newRule.toString();
}

/**
 * Creates an availability RRULE for a specific time period during the schedule period.
 * Uses the schedule's dtstart (A) and until (B) from the schedule RRULE.
 * Example: For "before mission" part (9am-10am) or "after mission" part (11am-12pm)
 * during the schedule period.
 */
function createAvailabilityForSchedulePeriod(
  originalOptions: Partial<Options>,
  timeStart: Date,
  scheduleDtstart: Date,
  scheduleUntil: Date
): string {
  // Calculate the time of day from timeStart
  const hour = timeStart.getUTCHours();
  const minute = timeStart.getUTCMinutes();
  const second = timeStart.getUTCSeconds();

  // Set dtstart to scheduleDtstart (A) but with the time from timeStart
  const dtstart = new Date(scheduleDtstart);
  dtstart.setUTCHours(hour, minute, second, 0);

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
    // Set UNTIL to scheduleUntil (B) - this availability only exists during schedule period
    until: scheduleUntil,
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
 * Extracts dtstart and until from a schedule RRULE.
 * Returns the schedule's dtstart (A) and until (B) from the RRULE itself.
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
