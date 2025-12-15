import { stats, tests } from './test-utils.ts';
// Import test files here as they are created
import './basic-updates.test.ts';
// import './complex-scenarios.test.ts';
// import './edge-cases.test.ts';

// Run all tests
console.log('Running updateAvailabilitiesForMissions tests...\n');

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
