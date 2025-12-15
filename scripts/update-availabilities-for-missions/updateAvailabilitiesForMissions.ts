import { RRule } from 'rrule';

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
  // TODO: Implement the function
  // This will:
  // 1. Generate all mission schedule occurrences
  // 2. For each mission occurrence, find overlapping availability occurrences
  // 3. Calculate which availabilities need to be split/truncated/modified
  // 4. Calculate which new availabilities need to be created (blocked periods)
  // 5. Return the result

  return {
    toCreate: [],
    toUpdate: [],
  };
}
