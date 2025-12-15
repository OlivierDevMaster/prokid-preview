import { RRule, RRuleSet, rrulestr } from 'rrule';

import {
  type MissionSchedule,
  type ProfessionalAvailability,
  updateAvailabilitiesForMissions,
} from '../updateAvailabilitiesForMissions';
import { createWeeklyRRULE, missionEnd, missionStart } from './test-utils';

console.log('=== Debug: Multiple Availabilities Test ===\n');

// Three consecutive availabilities forming a continuous period: 8h-9h, 9h-10h, 10h-11h
const availability1: ProfessionalAvailability = {
  duration_mn: 60, // 8h-9h
  rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
};

const availability2: ProfessionalAvailability = {
  duration_mn: 60, // 9h-10h
  rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
};

const availability3: ProfessionalAvailability = {
  duration_mn: 60, // 10h-11h
  rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
};

// Mission schedule covers all three: 8h-11h
const missionSchedule: MissionSchedule = {
  duration_mn: 180, // 3 hours
  rrule: createWeeklyRRULE(
    new Date('2024-01-08T08:00:00Z'),
    new Date('2024-01-29T08:00:00Z'),
    'MO'
  ),
};

console.log('Input:');
console.log('- Availability 1:', availability1.rrule);
console.log('- Availability 2:', availability2.rrule);
console.log('- Availability 3:', availability3.rrule);
console.log('- Mission Schedule:', missionSchedule.rrule);
console.log('- Mission Start:', missionStart.toISOString());
console.log('- Mission End:', missionEnd.toISOString());
console.log('');

// Check availability occurrences
console.log('=== Availability Occurrences ===');
const rule1 = rrulestr(availability1.rrule);
const rule2 = rrulestr(availability2.rrule);
const rule3 = rrulestr(availability3.rrule);

const availOccs1 = rule1.between(missionStart, missionEnd, true);
const availOccs2 = rule2.between(missionStart, missionEnd, true);
const availOccs3 = rule3.between(missionStart, missionEnd, true);

console.log('Avail1 occurrences (Jan 8-31):', availOccs1.length);
if (availOccs1.length > 0) {
  console.log('  First:', availOccs1[0].toISOString());
  console.log(
    '  End time:',
    new Date(availOccs1[0].getTime() + 60 * 60 * 1000).toISOString()
  );
}
console.log('Avail2 occurrences (Jan 8-31):', availOccs2.length);
if (availOccs2.length > 0) {
  console.log('  First:', availOccs2[0].toISOString());
  console.log(
    '  End time:',
    new Date(availOccs2[0].getTime() + 60 * 60 * 1000).toISOString()
  );
}
console.log('Avail3 occurrences (Jan 8-31):', availOccs3.length);
if (availOccs3.length > 0) {
  console.log('  First:', availOccs3[0].toISOString());
  console.log(
    '  End time:',
    new Date(availOccs3[0].getTime() + 60 * 60 * 1000).toISOString()
  );
}
console.log('');

// Check mission occurrences
console.log('=== Mission Occurrences ===');
const missionRule = rrulestr(missionSchedule.rrule);
const missionOccs = missionRule.between(
  missionRule.options.dtstart || missionStart,
  missionRule.options.until || missionEnd,
  true
);
console.log('Mission occurrences:', missionOccs.length);
if (missionOccs.length > 0) {
  const firstMissionOcc = missionOccs[0];
  const firstMissionEnd = new Date(
    firstMissionOcc.getTime() + missionSchedule.duration_mn * 60 * 1000
  );
  console.log('  First occurrence:', firstMissionOcc.toISOString());
  console.log('  First mission end:', firstMissionEnd.toISOString());
  console.log('');

  // Check overlaps manually
  console.log('=== Manual Overlap Check ===');
  const availOcc1 = availOccs1[0];
  const availEnd1 = new Date(availOcc1.getTime() + 60 * 60 * 1000);
  console.log(
    'Avail1:',
    availOcc1.toISOString(),
    'to',
    availEnd1.toISOString()
  );
  console.log(
    'Mission:',
    firstMissionOcc.toISOString(),
    'to',
    firstMissionEnd.toISOString()
  );
  const overlap1 =
    firstMissionOcc.getTime() < availEnd1.getTime() &&
    firstMissionEnd.getTime() > availOcc1.getTime();
  console.log('  Overlap?', overlap1);
  console.log(
    '  missionOcc < availEnd1?',
    firstMissionOcc.getTime() < availEnd1.getTime()
  );
  console.log(
    '  missionEnd > availOcc1?',
    firstMissionEnd.getTime() > availOcc1.getTime()
  );
  console.log('');

  const availOcc2 = availOccs2[0];
  const availEnd2 = new Date(availOcc2.getTime() + 60 * 60 * 1000);
  console.log(
    'Avail2:',
    availOcc2.toISOString(),
    'to',
    availEnd2.toISOString()
  );
  const overlap2 =
    firstMissionOcc.getTime() < availEnd2.getTime() &&
    firstMissionEnd.getTime() > availOcc2.getTime();
  console.log('  Overlap?', overlap2);
  console.log(
    '  missionOcc < availEnd2?',
    firstMissionOcc.getTime() < availEnd2.getTime()
  );
  console.log(
    '  missionEnd > availOcc2?',
    firstMissionEnd.getTime() > availOcc2.getTime()
  );
  console.log('');

  const availOcc3 = availOccs3[0];
  const availEnd3 = new Date(availOcc3.getTime() + 60 * 60 * 1000);
  console.log(
    'Avail3:',
    availOcc3.toISOString(),
    'to',
    availEnd3.toISOString()
  );
  const overlap3 =
    firstMissionOcc.getTime() < availEnd3.getTime() &&
    firstMissionEnd.getTime() > availOcc3.getTime();
  console.log('  Overlap?', overlap3);
  console.log(
    '  missionOcc < availEnd3?',
    firstMissionOcc.getTime() < availEnd3.getTime()
  );
  console.log(
    '  missionEnd > availOcc3?',
    firstMissionEnd.getTime() > availOcc3.getTime()
  );
  console.log('');
}

console.log('=== Calling Function ===');
console.log('Availabilities count:', 3);
console.log('Schedules count:', 1);
console.log('');

// Add temporary logging to the function by creating a wrapper
// Actually, let's just call it and see what happens
const result = updateAvailabilitiesForMissions(
  [availability1, availability2, availability3],
  [missionSchedule],
  missionStart,
  missionEnd
);

console.log('=== Function Result ===');

console.log('Updates:', result.toUpdate.length);
console.log('Creates:', result.toCreate.length);
console.log('');

if (result.toUpdate.length > 0) {
  console.log('=== Updates ===');
  result.toUpdate.forEach((update, i) => {
    console.log(`Update ${i + 1}:`);
    console.log(
      '  Original duration:',
      update.originalAvailability.duration_mn
    );
    console.log('  New duration:', update.newDurationMn);
    console.log('  New RRULE:', update.newRrule);
  });
  console.log('');
}

if (result.toCreate.length > 0) {
  console.log('=== Creates ===');
  result.toCreate.forEach((create, i) => {
    console.log(`Create ${i + 1}:`);
    console.log('  Duration:', create.duration_mn);
    console.log('  RRULE:', create.rrule);
    const rule = rrulestr(create.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    console.log('  DTSTART:', ruleObj.options.dtstart?.toISOString());
    console.log('  UNTIL:', ruleObj.options.until?.toISOString());
  });
  console.log('');
}

console.log('=== Expected vs Actual ===');
console.log('Expected updates: 3');
console.log('Actual updates:', result.toUpdate.length);
console.log('Expected creates: 3 (post-mission)');
console.log('Actual creates:', result.toCreate.length);
console.log('');

// Debug: Check what times are being passed to calculateAvailabilityModifications
console.log('=== Debug: Check Case Matching ===');
const missionOcc = new Date('2024-01-08T08:00:00Z');
const missionEndTime = new Date('2024-01-08T11:00:00Z');
const availOcc1 = new Date('2024-01-08T08:00:00Z');
const availEnd1 = new Date('2024-01-08T09:00:00Z');
const availOcc2 = new Date('2024-01-08T09:00:00Z');
const availEnd2 = new Date('2024-01-08T10:00:00Z');
const availOcc3 = new Date('2024-01-08T10:00:00Z');
const availEnd3 = new Date('2024-01-08T11:00:00Z');

console.log('Avail1 (8h-9h):');
console.log(
  '  missionStart === availStart?',
  Math.abs(missionOcc.getTime() - availOcc1.getTime()) < 60000
);
console.log(
  '  missionEnd < availEnd?',
  missionEndTime.getTime() < availEnd1.getTime()
);
console.log(
  '  Case 1 match?',
  Math.abs(missionOcc.getTime() - availOcc1.getTime()) < 60000 &&
    missionEndTime.getTime() < availEnd1.getTime()
);
console.log(
  '  missionEnd === availEnd?',
  Math.abs(missionEndTime.getTime() - availEnd1.getTime()) < 60000
);
console.log(
  '  Case 4 match?',
  Math.abs(missionOcc.getTime() - availOcc1.getTime()) < 60000 &&
    Math.abs(missionEndTime.getTime() - availEnd1.getTime()) < 60000
);
console.log('');

console.log('Avail2 (9h-10h):');
console.log(
  '  missionStart > availStart?',
  missionOcc.getTime() > availOcc2.getTime()
);
console.log(
  '  missionEnd < availEnd?',
  missionEndTime.getTime() < availEnd2.getTime()
);
console.log(
  '  Case 3 match?',
  missionOcc.getTime() > availOcc2.getTime() &&
    missionEndTime.getTime() < availEnd2.getTime()
);
console.log('');

console.log('Avail3 (10h-11h):');
console.log(
  '  missionStart > availStart?',
  missionOcc.getTime() > availOcc3.getTime()
);
console.log(
  '  missionEnd === availEnd?',
  Math.abs(missionEndTime.getTime() - availEnd3.getTime()) < 60000
);
console.log(
  '  Case 2 match?',
  missionOcc.getTime() > availOcc3.getTime() &&
    Math.abs(missionEndTime.getTime() - availEnd3.getTime()) < 60000
);
console.log(
  '  Case 4 match?',
  Math.abs(missionOcc.getTime() - availOcc3.getTime()) < 60000 &&
    Math.abs(missionEndTime.getTime() - availEnd3.getTime()) < 60000
);
