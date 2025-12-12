import { RRule, RRuleSet, rrulestr, Options } from 'rrule';

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
 * Result of validating mission schedules against professional availabilities
 */
export interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
}

/**
 * Represents a validation violation where a mission occurrence
 * is not covered by any availability
 */
export interface ValidationViolation {
  mission_occurrence_end: string;
  mission_occurrence_start: string;
  mission_schedule_index: number;
  reason: string;
}

/**
 * Represents a time range with start and end times
 */
interface TimeRange {
  end: Date;
  start: Date;
}

/**
 * Validates that all mission schedule occurrences fall within
 * at least one professional availability.
 *
 * The function:
 * 1. Constrains each mission schedule RRULE by mission date range (ensures consistency with stored data)
 * 2. Generates all occurrences for each constrained mission schedule
 * 3. Generates all occurrences for each professional availability
 * 4. Checks that each mission occurrence is fully contained within at least one availability occurrence
 * 5. Returns validation result with any violations found
 *
 * @param missionSchedules - Array of mission schedules with RRULE and duration
 * @param missionDtstart - Mission start date
 * @param missionUntil - Mission end date
 * @param availabilities - Array of professional availabilities
 * @returns Validation result with isValid flag and any violations
 */
export function validateMissionAvailability(
  missionSchedules: MissionSchedule[],
  missionDtstart: Date,
  missionUntil: Date,
  availabilities: ProfessionalAvailability[]
): ValidationResult {
  validateMissionDateRange(missionDtstart, missionUntil);

  const violations: ValidationViolation[] = [];

  for (
    let scheduleIndex = 0;
    scheduleIndex < missionSchedules.length;
    scheduleIndex++
  ) {
    const schedule = missionSchedules[scheduleIndex];

    // Validate that duration is positive
    if (schedule.duration_mn <= 0) {
      violations.push({
        mission_occurrence_end: '',
        mission_occurrence_start: '',
        mission_schedule_index: scheduleIndex,
        reason: `Mission schedule at index ${scheduleIndex} has invalid duration: ${schedule.duration_mn} minutes. Duration must be greater than 0.`,
      });
      continue;
    }

    const scheduleViolations = validateSchedule(
      schedule,
      scheduleIndex,
      missionDtstart,
      missionUntil,
      availabilities
    );
    violations.push(...scheduleViolations);
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Checks if a mission occurrence can be fully covered by a combination of availability occurrences.
 * A mission occurrence is covered if all its time is within at least one availability occurrence,
 * or if it can be fully covered by multiple consecutive/overlapping availability occurrences.
 */
function checkOccurrenceCoverage(
  missionOcc: Date,
  missionDurationMn: number,
  availabilities: ProfessionalAvailability[],
  missionDtstart: Date,
  missionUntil: Date
): boolean {
  const missionOccEnd = new Date(
    missionOcc.getTime() + missionDurationMn * 60 * 1000
  );

  // Collect all availability occurrences that overlap with the mission occurrence
  const overlappingAvailRanges: TimeRange[] = [];

  for (const availability of availabilities) {
    try {
      const availabilityOccurrences = generateAvailabilityOccurrences(
        availability,
        missionDtstart,
        missionUntil
      );

      for (const availOcc of availabilityOccurrences) {
        const availOccEnd = new Date(
          availOcc.getTime() + availability.duration_mn * 60 * 1000
        );

        // Check if this availability occurrence overlaps with the mission occurrence
        // Overlap: missionOcc < availOccEnd && missionOccEnd > availOcc
        if (
          missionOcc.getTime() < availOccEnd.getTime() &&
          missionOccEnd.getTime() > availOcc.getTime()
        ) {
          // Extract the overlapping portion
          const overlapStart = new Date(
            Math.max(missionOcc.getTime(), availOcc.getTime())
          );
          const overlapEnd = new Date(
            Math.min(missionOccEnd.getTime(), availOccEnd.getTime())
          );

          overlappingAvailRanges.push({
            end: overlapEnd,
            start: overlapStart,
          });
        }
      }
    } catch (rruleError) {
      // Skip invalid availability RRULEs, but log the error
      console.error(
        `Error parsing availability RRULE:`,
        rruleError,
        availability
      );
      continue;
    }
  }

  // If no overlapping availabilities, mission is not covered
  if (overlappingAvailRanges.length === 0) {
    return false;
  }

  // Sort by start time
  overlappingAvailRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Check if the overlapping ranges fully cover the mission occurrence
  // We need to check if the union of all overlapping ranges covers the entire mission time
  let coveredStart = missionOcc.getTime();
  const missionEndTime = missionOccEnd.getTime();

  for (const range of overlappingAvailRanges) {
    // If this range starts after what we've covered so far, there's a gap
    if (range.start.getTime() > coveredStart) {
      return false; // Gap found, mission not fully covered
    }

    // Update covered start to the end of this range (if it extends further)
    if (range.end.getTime() > coveredStart) {
      coveredStart = range.end.getTime();
    }

    // If we've covered the entire mission, we're done
    if (coveredStart >= missionEndTime) {
      return true;
    }
  }

  // Check if we've fully covered the mission
  return coveredStart >= missionEndTime;
}

/**
 * Constrains an RRULE by mission start and end dates.
 * Extracts the time from the RRULE's DTSTART and applies it to the mission date range.
 * Preserves EXDATE exceptions and ensures UNTIL is set.
 *
 * This ensures the validation uses the same constrained RRULEs that will be stored in the database.
 *
 * @param rrule - RRULE string (RFC 5545 format, newline-separated)
 * @param missionDtstart - Mission start date
 * @param missionUntil - Mission end date
 * @returns Constrained RRULE string with mission date boundaries
 */
function constrainRRULEByDates(
  rrule: string,
  missionDtstart: Date,
  missionUntil: Date
): string {
  // Parse the RRULE - extract only parseable parts (DTSTART and RRULE lines)
  // Remove EXDATE lines for parsing, we'll add them back later
  const parseableRRULE = extractParseableRRULE(rrule);
  const rule = rrulestr(parseableRRULE);

  // Extract time components from RRULE's DTSTART
  const originalDtstart = rule.options.dtstart || new Date();
  const hour = originalDtstart.getUTCHours();
  const minute = originalDtstart.getUTCMinutes();
  const second = originalDtstart.getUTCSeconds();

  // Create new DTSTART: mission start date with original time
  const newDtstart = new Date(missionDtstart);
  newDtstart.setUTCHours(hour, minute, second, 0);

  // Create new UNTIL: mission end date with original time
  const newUntil = new Date(missionUntil);
  newUntil.setUTCHours(hour, minute, second, 0);

  // Build RRULE options from original pattern
  const rruleOptions: Partial<Options> = {
    bymonth: rule.options.bymonth,
    bymonthday: rule.options.bymonthday,
    bysetpos: rule.options.bysetpos,
    byweekday: rule.options.byweekday,
    byweekno: rule.options.byweekno,
    byyearday: rule.options.byyearday,
    dtstart: newDtstart,
    freq: rule.options.freq,
    interval: rule.options.interval,
    until: newUntil,
    wkst: rule.options.wkst,
  };

  // Remove bysetpos if present (can conflict with UNTIL when modifying DTSTART)
  delete rruleOptions.bysetpos;

  // Create new RRULE with mission date constraints (including UNTIL in options)
  const newRRule = new RRule(rruleOptions);

  // Get the formatted RRULE string from the library
  // The library formats it as: DTSTART:...\nRRULE:...;UNTIL=...
  const formattedRRULE = newRRule.toString();

  // Get EXDATE from original RRULE if present
  const exdateLines: string[] = [];
  const rruleLines = rrule.split('\n');
  for (const line of rruleLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('EXDATE:')) {
      exdateLines.push(trimmed);
    }
  }

  // Combine all parts - the library already includes DTSTART and RRULE with UNTIL
  let result = formattedRRULE;
  if (exdateLines.length > 0) {
    result += '\n' + exdateLines.join('\n');
  }

  return result;
}

/**
 * Extracts just the parseable parts of an RRULE string (DTSTART and RRULE lines)
 * Removes EXDATE lines for parsing (they'll be added back later)
 * @param rruleString - Full RRULE string with DTSTART, RRULE, UNTIL, EXDATE lines
 * @returns String with only DTSTART and RRULE lines (parseable by rrulestr)
 */
function extractParseableRRULE(rruleString: string): string {
  const lines = rruleString.split('\n');
  const parseableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DTSTART:') || trimmed.startsWith('RRULE:')) {
      parseableLines.push(trimmed);
    }
    // Skip UNTIL and EXDATE lines - they can't be parsed by rrulestr()
  }

  return parseableLines.join('\n');
}

/**
 * Generates all occurrences for a professional availability.
 * Handles both RRule and RRuleSet (when EXDATE is present).
 */
function generateAvailabilityOccurrences(
  availability: ProfessionalAvailability,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const availabilityRule = rrulestr(availability.rrule);

  // Check if it's an RRuleSet (when EXDATE is present, rrulestr returns RRuleSet)
  let availabilityStart: Date | null = null;
  let availabilityUntil: Date | null = null;

  if (
    availabilityRule instanceof RRuleSet ||
    typeof (availabilityRule as RRuleSet).rrules === 'function'
  ) {
    // It's an RRuleSet - get dtstart/until from the first RRule
    const rruleSet = availabilityRule as RRuleSet;
    const rules = rruleSet.rrules();

    if (rules.length > 0) {
      const firstRule = rules[0];
      availabilityStart = firstRule.options.dtstart || null;
      availabilityUntil = firstRule.options.until || null;
    }
  } else {
    // It's a regular RRule
    const rrule = availabilityRule as RRule;
    availabilityStart = rrule.options.dtstart || null;
    availabilityUntil = rrule.options.until || null;
  }

  // Use extracted dates or fallback to defaults
  const effectiveStart =
    availabilityStart && availabilityStart < missionDtstart
      ? missionDtstart
      : availabilityStart || missionDtstart;
  const effectiveUntil =
    availabilityUntil && availabilityUntil > missionUntil
      ? missionUntil
      : availabilityUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // RRuleSet.between() works the same as RRule.between()
  return availabilityRule.between(effectiveStart, effectiveUntil, true);
}

/**
 * Generates all occurrences for a mission schedule within the mission date range.
 * First constrains the RRULE by mission dates to ensure consistency with stored data.
 * Handles both RRule and RRuleSet (when EXDATE is present).
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  // Constrain the RRULE by mission dates first (ensures consistency with database)
  const constrainedRRULE = constrainRRULEByDates(
    schedule.rrule,
    missionDtstart,
    missionUntil
  );

  const missionRule = rrulestr(constrainedRRULE);

  // Get the effective date range from the constrained RRULE
  // Handle both RRule and RRuleSet
  let scheduleStart: Date = missionDtstart;
  let scheduleUntil: Date = missionUntil;

  if (
    missionRule instanceof RRuleSet ||
    typeof (missionRule as RRuleSet).rrules === 'function'
  ) {
    // It's an RRuleSet - get dtstart/until from the first RRule
    const rruleSet = missionRule as RRuleSet;
    const rules = rruleSet.rrules();

    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleStart = firstRule.options.dtstart || missionDtstart;
      scheduleUntil = firstRule.options.until || missionUntil;
    }
  } else {
    // It's a regular RRule
    const rrule = missionRule as RRule;
    scheduleStart = rrule.options.dtstart || missionDtstart;
    scheduleUntil = rrule.options.until || missionUntil;
  }

  // Generate occurrences - the RRULE is already constrained, so we can use the full range
  // RRuleSet.between() works the same as RRule.between()
  return missionRule.between(scheduleStart, scheduleUntil, true);
}

/**
 * Validates that mission date range is valid
 */
function validateMissionDateRange(
  missionDtstart: Date,
  missionUntil: Date
): void {
  if (isNaN(missionDtstart.getTime()) || isNaN(missionUntil.getTime())) {
    throw new Error('Invalid mission date range');
  }

  if (missionUntil <= missionDtstart) {
    throw new Error('Mission end date must be after start date');
  }
}

/**
 * Validates a single mission schedule against all availabilities
 */
function validateSchedule(
  schedule: MissionSchedule,
  scheduleIndex: number,
  missionDtstart: Date,
  missionUntil: Date,
  availabilities: ProfessionalAvailability[]
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  try {
    const missionOccurrences = generateMissionOccurrences(
      schedule,
      missionDtstart,
      missionUntil
    );

    for (const missionOcc of missionOccurrences) {
      const isCovered = checkOccurrenceCoverage(
        missionOcc,
        schedule.duration_mn,
        availabilities,
        missionDtstart,
        missionUntil
      );

      if (!isCovered) {
        const missionOccEnd = new Date(
          missionOcc.getTime() + schedule.duration_mn * 60 * 1000
        );

        violations.push({
          mission_occurrence_end: missionOccEnd.toISOString(),
          mission_occurrence_start: missionOcc.toISOString(),
          mission_schedule_index: scheduleIndex,
          reason: `Mission occurrence from ${missionOcc.toISOString()} to ${missionOccEnd.toISOString()} is not covered by any professional availability`,
        });
      }
    }
  } catch (rruleError) {
    // If we can't parse or constrain the mission schedule RRULE, that's a critical error
    throw new Error(
      `Invalid RRULE in mission schedule at index ${scheduleIndex}: ${String(rruleError)}`
    );
  }

  return violations;
}
