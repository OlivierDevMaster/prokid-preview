import { rrulestr } from 'rrule';

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
 * Validates that all mission schedule occurrences fall within
 * at least one professional availability.
 *
 * The function:
 * 1. Generates all occurrences for each mission schedule within the mission date range
 * 2. Generates all occurrences for each professional availability
 * 3. Checks that each mission occurrence is fully contained within at least one availability occurrence
 * 4. Returns validation result with any violations found
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
 * Checks if a mission occurrence is covered by any availability
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

        if (
          isOccurrenceCovered(missionOcc, missionOccEnd, availOcc, availOccEnd)
        ) {
          return true;
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

  return false;
}

/**
 * Generates all occurrences for a professional availability
 */
function generateAvailabilityOccurrences(
  availability: ProfessionalAvailability,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const availabilityRule = rrulestr(availability.rrule);

  const availabilityStart = availabilityRule.options.dtstart || missionDtstart;
  const availabilityUntil =
    availabilityRule.options.until ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const effectiveStart =
    availabilityStart < missionDtstart ? missionDtstart : availabilityStart;
  const effectiveUntil =
    availabilityUntil > missionUntil ? missionUntil : availabilityUntil;

  return availabilityRule.between(effectiveStart, effectiveUntil, true);
}

/**
 * Generates all occurrences for a mission schedule within the mission date range
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  const missionRule = rrulestr(schedule.rrule);

  const scheduleStart = missionRule.options.dtstart || missionDtstart;
  const scheduleUntil = missionRule.options.until || missionUntil;

  return missionRule.between(
    scheduleStart < missionDtstart ? missionDtstart : scheduleStart,
    scheduleUntil > missionUntil ? missionUntil : scheduleUntil,
    true
  );
}

/**
 * Checks if a mission occurrence is fully contained within an availability occurrence
 */
function isOccurrenceCovered(
  missionOccStart: Date,
  missionOccEnd: Date,
  availOccStart: Date,
  availOccEnd: Date
): boolean {
  return (
    missionOccStart.getTime() >= availOccStart.getTime() &&
    missionOccEnd.getTime() <= availOccEnd.getTime()
  );
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
    // If we can't parse the mission schedule RRULE, that's a critical error
    throw new Error(
      `Invalid RRULE in mission schedule at index ${scheduleIndex}: ${String(rruleError)}`
    );
  }

  return violations;
}
