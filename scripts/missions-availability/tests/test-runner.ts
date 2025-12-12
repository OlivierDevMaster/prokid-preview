import './availability-exceptions.test.ts';
import './basic-validation.test.ts';
import './complex-multi-availability.test.ts';
import './constraint-behavior.test.ts';
import './date-range-constraints.test.ts';
import './edge-cases.test.ts';
import './long-duration.test.ts';
import './multiple-schedules.test.ts';
import './overlapping-availabilities.test.ts';
import './rrule-frequencies.test.ts';
import './time-boundaries.test.ts';
import './violation-details.test.ts';
import { stats, tests } from './test-utils.ts';

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
