import './one-time-mission.test';
import { stats, tests } from './test-utils';

// Run only one-time mission tests
console.log('Running one-time mission tests...\n');

const oneTimeTests = tests.filter(t => t.name.includes('one-time'));

for (const testCase of oneTimeTests) {
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
  `\nResults: ${stats.passed} passed, ${stats.failed} failed, ${oneTimeTests.length} total`
);

if (stats.failed > 0) {
  process.exit(1);
}
