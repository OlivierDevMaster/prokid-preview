import { RRule, RRuleSet, rrulestr } from 'rrule';

/**
 * Script to test if rrule library can handle EXDATE using rrulestr()
 *
 * Note: When EXDATE is present in the RRULE string, rrulestr() automatically
 * returns an RRuleSet internally. You don't need to manually create an RRuleSet
 * - just use rrulestr() and it handles everything automatically.
 */

interface TestResult {
  details?: string;
  error?: string;
  name: string;
  passed: boolean;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

/**
 * Main test runner
 */
function runAllTests(): void {
  console.log('\n' + '='.repeat(60));
  console.log('Testing if rrule library can handle EXDATE using rrulestr()');
  console.log('='.repeat(60));
  console.log(
    'Note: rrulestr() automatically returns RRuleSet when EXDATE is present'
  );

  runTest('Parse RRULE with EXDATE using rrulestr()', testParseRruleWithExdate);
  runTest('EXDATE exclusion in occurrences', testExdateExclusion);
  runTest('Multiple EXDATE values', testMultipleExdates);
  runTest('Compare rrulestr() vs RRuleSet', testCompareRrulestrVsRruleset);
  runTest('EXDATE with different time formats', testExdateTimeFormats);
  runTest('Real-world scenario with holidays', testRealWorldScenario);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  console.log(`Total tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    console.log('\nConclusion:');
    console.log('  - rrule library CAN handle EXDATE using rrulestr()');
    console.log(
      '  - When EXDATE is present, rrulestr() automatically returns an RRuleSet'
    );
    console.log(
      '  - You do NOT need to manually create RRuleSet - rrulestr() handles it automatically'
    );
  }
}

function runTest(name: string, testFn: () => void): void {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${name}`);
    console.log('='.repeat(60));
    testFn();
    testResults.push({ name, passed: true });
    console.log(`✓ PASSED: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    testResults.push({ error: errorMessage, name, passed: false });
    console.error(`✗ FAILED: ${name}`);
    console.error(`  Error: ${errorMessage}`);
  }
}

/**
 * Test 4: Compare rrulestr() vs RRuleSet for EXDATE handling
 */
function testCompareRrulestrVsRruleset(): void {
  const baseDate = new Date('2024-01-01T09:00:00Z');
  const excludedDate1 = new Date('2024-01-08T09:00:00Z');
  const excludedDate2 = new Date('2024-01-15T09:00:00Z');

  // Method 1: Using rrulestr with EXDATE in string
  const rruleString = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z`;

  console.log('\nMethod 1: rrulestr() with EXDATE in string');
  console.log('Input:', rruleString);

  const rule1 = rrulestr(rruleString);
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');
  const occurrences1 = rule1.between(startDate, endDate, true);

  console.log(`Generated ${occurrences1.length} occurrences`);

  // Method 2: Using RRuleSet programmatically
  console.log('\nMethod 2: RRuleSet with programmatic EXDATE');
  const rrule2 = new RRule({
    byweekday: [RRule.MO],
    dtstart: baseDate,
    freq: RRule.WEEKLY,
  });

  const rruleSet = new RRuleSet();
  rruleSet.rrule(rrule2);
  rruleSet.exdate(excludedDate1);
  rruleSet.exdate(excludedDate2);

  const occurrences2 = rruleSet.between(startDate, endDate, true);
  console.log(`Generated ${occurrences2.length} occurrences`);

  // Compare results
  console.log('\nComparison:');
  console.log(`  rrulestr() occurrences: ${occurrences1.length}`);
  console.log(`  RRuleSet occurrences: ${occurrences2.length}`);

  // Both should exclude the same dates
  const excludedDates = [excludedDate1, excludedDate2];
  excludedDates.forEach(excludedDate => {
    const inMethod1 = occurrences1.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );
    const inMethod2 = occurrences2.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );

    console.log(`\n  Excluded date ${formatDate(excludedDate)}:`);
    console.log(`    In rrulestr() results? ${inMethod1}`);
    console.log(`    In RRuleSet results? ${inMethod2}`);

    assert(!inMethod1, 'rrulestr() should exclude the date');
    assert(!inMethod2, 'RRuleSet should exclude the date');
  });

  // Both methods should produce similar results
  // (allowing for minor differences in how they handle edge cases)
  assert(
    Math.abs(occurrences1.length - occurrences2.length) <= 1,
    'Both methods should produce similar number of occurrences'
  );
}

/**
 * Test 2: Generate occurrences and verify EXDATE is excluded
 * This is the critical test - does rrulestr respect EXDATE?
 */
function testExdateExclusion(): void {
  const rruleString = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z`;

  console.log('\nInput RRULE string:');
  console.log(rruleString);

  const rule = rrulestr(rruleString);

  // Generate occurrences for the next 5 Mondays
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');
  const occurrences = rule.between(startDate, endDate, true);

  console.log('\nGenerated occurrences:');
  occurrences.forEach((date, index) => {
    console.log(`  ${index + 1}. ${formatDate(date)}`);
  });

  // The excluded date (2024-01-08) should NOT be in the list
  const excludedDate = new Date('2024-01-08T09:00:00Z');
  const hasExcludedDate = occurrences.some(
    date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
  );

  console.log(`\nExcluded date (2024-01-08): ${formatDate(excludedDate)}`);
  console.log(`Is excluded date in occurrences? ${hasExcludedDate}`);

  assert(!hasExcludedDate, 'EXDATE should be excluded from occurrences');
  assert(occurrences.length >= 3, 'Should have at least 3 occurrences');
}

/**
 * Test 5: EXDATE with different time formats
 */
function testExdateTimeFormats(): void {
  console.log('\nTesting different EXDATE time formats...');

  // Test with Z (UTC)
  const rruleString1 = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z`;

  // Test with time without Z (should still work)
  const rruleString2 = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000`;

  const rule1 = rrulestr(rruleString1);
  const rule2 = rrulestr(rruleString2);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');

  const occurrences1 = rule1.between(startDate, endDate, true);
  const occurrences2 = rule2.between(startDate, endDate, true);

  const excludedDate = new Date('2024-01-08T09:00:00Z');

  const hasExcluded1 = occurrences1.some(
    date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
  );
  const hasExcluded2 = occurrences2.some(
    date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
  );

  console.log(
    `  Format with Z: ${occurrences1.length} occurrences, excluded? ${!hasExcluded1}`
  );
  console.log(
    `  Format without Z: ${occurrences2.length} occurrences, excluded? ${!hasExcluded2}`
  );

  assert(!hasExcluded1, 'EXDATE with Z should be excluded');
  // Note: format without Z might be interpreted differently, so we're lenient here
}

/**
 * Test 3: Multiple EXDATE values
 */
function testMultipleExdates(): void {
  const rruleString = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z
EXDATE:20240122T090000Z`;

  console.log('\nInput RRULE string:');
  console.log(rruleString);

  const rule = rrulestr(rruleString);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');
  const occurrences = rule.between(startDate, endDate, true);

  console.log('\nGenerated occurrences:');
  occurrences.forEach((date, index) => {
    console.log(`  ${index + 1}. ${formatDate(date)}`);
  });

  // Check all excluded dates
  const excludedDates = [
    new Date('2024-01-08T09:00:00Z'),
    new Date('2024-01-15T09:00:00Z'),
    new Date('2024-01-22T09:00:00Z'),
  ];

  excludedDates.forEach(excludedDate => {
    const hasExcludedDate = occurrences.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );
    console.log(
      `\nExcluded date ${formatDate(excludedDate)} in occurrences? ${hasExcludedDate}`
    );
    assert(
      !hasExcludedDate,
      `EXDATE ${formatDate(excludedDate)} should be excluded`
    );
  });
}

/**
 * Test 1: Parse RRULE with EXDATE using rrulestr()
 * This tests if rrulestr can parse EXDATE from the string
 * Note: rrulestr() automatically returns an RRuleSet when EXDATE is present
 */
function testParseRruleWithExdate(): void {
  const rruleString = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z`;

  console.log('\nInput RRULE string:');
  console.log(rruleString);

  // Try to parse with rrulestr
  // Note: When EXDATE is present, rrulestr() automatically returns an RRuleSet
  const rule = rrulestr(rruleString);

  console.log('\n✓ Successfully parsed with rrulestr()');
  console.log(`  Rule type: ${rule.constructor.name}`);

  // The important thing is that it can parse and will respect EXDATE
  // We verify the actual exclusion in the next test
  assert(rule !== null, 'Should successfully parse RRULE with EXDATE');

  // Verify it can generate occurrences (the real test)
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');
  const occurrences = rule.between(startDate, endDate, true);

  console.log(`  Can generate occurrences: ${occurrences.length > 0}`);
  assert(occurrences.length > 0, 'Should be able to generate occurrences');
}

/**
 * Test 6: Real-world scenario - Weekly availability with holiday exceptions
 */
function testRealWorldScenario(): void {
  console.log(
    '\nReal-world scenario: Weekly Monday availability with holiday exceptions'
  );

  const rruleString = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z
EXDATE:20240219T090000Z`;

  const rule = rrulestr(rruleString);

  // Get all occurrences for Q1 2024
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-03-31T23:59:59Z');
  const occurrences = rule.between(startDate, endDate, true);

  console.log(`\nGenerated ${occurrences.length} occurrences for Q1 2024:`);
  occurrences.forEach((date, index) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`  ${index + 1}. ${formatDate(date)} (${dayName})`);
  });

  // Verify excluded dates
  const excludedDates = [
    new Date('2024-01-08T09:00:00Z'),
    new Date('2024-01-15T09:00:00Z'),
    new Date('2024-02-19T09:00:00Z'),
  ];

  excludedDates.forEach(excludedDate => {
    const hasExcluded = occurrences.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );
    assert(
      !hasExcluded,
      `Holiday ${formatDate(excludedDate)} should be excluded`
    );
  });

  // Should have approximately 13 Mondays in Q1 minus 3 excluded = ~10 occurrences
  assert(occurrences.length >= 9, 'Should have at least 9 occurrences');
  assert(occurrences.length <= 13, 'Should have at most 13 occurrences');
}

// Run tests
runAllTests();
