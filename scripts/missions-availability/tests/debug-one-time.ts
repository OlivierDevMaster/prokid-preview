import { rrulestr } from 'rrule';
import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';

// Debug test to see what's happening
const missionSchedule: MissionSchedule = {
  duration_mn: 120,
  rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
};

const availability: ProfessionalAvailability = {
  duration_mn: 240,
  rrule: 'DTSTART:20250601T080000Z\nRRULE:FREQ=DAILY;UNTIL=20251231T180000Z',
};

const missionStart = new Date('2025-06-01T09:00:00Z');
const missionUntil = new Date('2025-06-01T11:00:00Z');

console.log('Mission schedule:', missionSchedule.rrule);
console.log('Mission start:', missionStart.toISOString());
console.log('Mission until:', missionUntil.toISOString());
console.log('Availability:', availability.rrule);

// Test the constrained RRULE
import { constrainRRULEByDates } from '../validateMissionAvailability.ts';
// Actually, constrainRRULEByDates is not exported, let me test the validation directly

const result = validateMissionAvailability(
  [missionSchedule],
  missionStart,
  missionUntil,
  [availability]
);

console.log('\nValidation result:');
console.log('Is valid:', result.isValid);
console.log('Violations:', JSON.stringify(result.violations, null, 2));

