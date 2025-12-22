import './availability-exceptions.test';
import './basic-validation.test';
import './complex-multi-availability.test';
import './constraint-behavior.test';
import './date-range-constraints.test';
import './edge-cases.test';
import './long-duration.test';
import './multiple-schedules.test';
import './one-time-mission.test';
import './overlapping-availabilities.test';
import './rrule-frequencies.test';
import './time-boundaries.test';
import './violation-details.test';
import { stats, tests } from './test-utils';

// Run all tests
console.log('Running validateMissionAvailability tests...\n');

for (const testCase of tests) {
  try {
    testCase.fn();
    console.log(`✓ ${testCase.name}`);
    stats.passed++;
  } catch (error) {
    console.error(`✗ ${testCase.name}`);
    console.error(
      `  ${error instanceof Error ? error.message : String(error)}\n`
    );
    stats.failed++;
  }
}

console.log(
  `\nResults: ${stats.passed} passed, ${stats.failed} failed, ${tests.length} total`
);

if (stats.failed > 0) {
  process.exit(1);
}
