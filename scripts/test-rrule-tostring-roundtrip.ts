import { rrulestr } from 'rrule';

/**
 * Script to test what happens when we:
 * 1. Parse an RRULE string with EXDATE using rrulestr()
 * 2. Get back an RRuleSet
 * 3. Call .toString() on that RRuleSet
 * 4. Compare with the original input
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

function normalizeRruleString(rrule: string): string {
  // Normalize line endings and trim
  return rrule
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Main test runner
 */
function runAllTests(): void {
  console.log('\n' + '='.repeat(60));
  console.log('Testing RRuleSet.toString() round-trip behavior');
  console.log('='.repeat(60));
  console.log(
    '\nQuestion: When we parse an RRULE with EXDATE using rrulestr(),'
  );
  console.log('it returns an RRuleSet. What happens when we call');
  console.log('.toString() on that RRuleSet? Do we get the same result?');

  runTest('Simple RRULE with single EXDATE', testSimpleRruleWithExdate);
  runTest('RRULE with multiple EXDATE values', testMultipleExdates);
  runTest('RRULE without EXDATE', testRruleWithoutExdate);
  runTest('RRULE with UNTIL and EXDATE', testRruleWithUntilAndExdate);
  runTest('String format differences', testStringFormatDifferences);
  runTest('Multiple round-trips', testMultipleRoundTrips);

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
    console.log('  - .toString() may not produce an exact string match, BUT');
    console.log(
      '  - The resulting string produces the same occurrences when parsed'
    );
    console.log('  - This means the round-trip is functionally equivalent');
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
 * Test 2: RRULE with multiple EXDATE values
 */
function testMultipleExdates(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z
EXDATE:20240122T090000Z`;

  console.log('\nOriginal RRULE string:');
  console.log(originalRrule);

  const rule = rrulestr(originalRrule);
  const toStringResult = rule.toString();

  console.log('\nResult from .toString():');
  console.log(toStringResult);

  // Test if occurrences match
  const originalRule = rrulestr(originalRrule);
  const resultRule = rrulestr(toStringResult);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');

  const originalOccurrences = originalRule.between(startDate, endDate, true);
  const resultOccurrences = resultRule.between(startDate, endDate, true);

  console.log(`\nOriginal occurrences: ${originalOccurrences.length}`);
  console.log(`Result occurrences: ${resultOccurrences.length}`);

  // Verify excluded dates are still excluded
  const excludedDates = [
    new Date('2024-01-08T09:00:00Z'),
    new Date('2024-01-15T09:00:00Z'),
    new Date('2024-01-22T09:00:00Z'),
  ];

  excludedDates.forEach(excludedDate => {
    const inOriginal = originalOccurrences.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );
    const inResult = resultOccurrences.some(
      date => Math.abs(date.getTime() - excludedDate.getTime()) < 1000
    );

    console.log(`\nExcluded date ${formatDate(excludedDate)}:`);
    console.log(`  In original? ${inOriginal}`);
    console.log(`  In result? ${inResult}`);

    assert(!inOriginal, 'Should be excluded in original');
    assert(!inResult, 'Should be excluded in result');
  });

  // Check if occurrences match
  const occurrencesMatch =
    originalOccurrences.length === resultOccurrences.length &&
    originalOccurrences.every((date, index) => {
      const resultDate = resultOccurrences[index];
      return Math.abs(date.getTime() - resultDate.getTime()) < 1000;
    });

  assert(occurrencesMatch, 'Occurrences should match after round-trip');
}

/**
 * Test 6: Round-trip multiple times
 */
function testMultipleRoundTrips(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z`;

  console.log('\nTesting multiple round-trips...');
  console.log('\nOriginal:');
  console.log(originalRrule);

  let currentRrule = originalRrule;

  // Do 3 round-trips
  for (let i = 1; i <= 3; i++) {
    const rule = rrulestr(currentRrule);
    currentRrule = rule.toString();

    console.log(`\nAfter round-trip ${i}:`);
    console.log(currentRrule);

    // Verify occurrences still match
    const originalRule = rrulestr(originalRrule);
    const currentRule = rrulestr(currentRrule);

    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-02-29T23:59:59Z');

    const originalOccurrences = originalRule.between(startDate, endDate, true);
    const currentOccurrences = currentRule.between(startDate, endDate, true);

    const occurrencesMatch =
      originalOccurrences.length === currentOccurrences.length &&
      originalOccurrences.every((date, index) => {
        const currentDate = currentOccurrences[index];
        return Math.abs(date.getTime() - currentDate.getTime()) < 1000;
      });

    console.log(
      `  Occurrences match? ${occurrencesMatch} (${originalOccurrences.length} vs ${currentOccurrences.length})`
    );

    assert(occurrencesMatch, `Occurrences should match after round-trip ${i}`);
  }
}

/**
 * Test 3: RRULE without EXDATE (simple case)
 */
function testRruleWithoutExdate(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO`;

  console.log('\nOriginal RRULE string:');
  console.log(originalRrule);

  const rule = rrulestr(originalRrule);
  console.log(`\nParsed rule type: ${rule.constructor.name}`);

  const toStringResult = rule.toString();
  console.log('\nResult from .toString():');
  console.log(toStringResult);

  // Normalize both for comparison
  const normalizedOriginal = normalizeRruleString(originalRrule);
  const normalizedResult = normalizeRruleString(toStringResult);

  console.log('\nComparison:');
  console.log('Original (normalized):');
  console.log(normalizedOriginal);
  console.log('\nResult (normalized):');
  console.log(normalizedResult);

  // For simple RRULE without EXDATE, it might match more closely
  const exactMatch = normalizedOriginal === normalizedResult;
  console.log(`\nExact match? ${exactMatch}`);

  // Test occurrences
  const originalRule = rrulestr(originalRrule);
  const resultRule = rrulestr(toStringResult);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');

  const originalOccurrences = originalRule.between(startDate, endDate, true);
  const resultOccurrences = resultRule.between(startDate, endDate, true);

  console.log(`\nOriginal occurrences: ${originalOccurrences.length}`);
  console.log(`Result occurrences: ${resultOccurrences.length}`);

  const occurrencesMatch =
    originalOccurrences.length === resultOccurrences.length &&
    originalOccurrences.every((date, index) => {
      const resultDate = resultOccurrences[index];
      return Math.abs(date.getTime() - resultDate.getTime()) < 1000;
    });

  assert(occurrencesMatch, 'Occurrences should match after round-trip');
}

/**
 * Test 4: RRULE with UNTIL and EXDATE
 */
function testRruleWithUntilAndExdate(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20240229T090000Z
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z`;

  console.log('\nOriginal RRULE string:');
  console.log(originalRrule);

  const rule = rrulestr(originalRrule);
  const toStringResult = rule.toString();

  console.log('\nResult from .toString():');
  console.log(toStringResult);

  // Test occurrences
  const originalRule = rrulestr(originalRrule);
  const resultRule = rrulestr(toStringResult);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-03-31T23:59:59Z');

  const originalOccurrences = originalRule.between(startDate, endDate, true);
  const resultOccurrences = resultRule.between(startDate, endDate, true);

  console.log(`\nOriginal occurrences: ${originalOccurrences.length}`);
  console.log(`Result occurrences: ${resultOccurrences.length}`);

  // Verify UNTIL is respected
  const untilDate = new Date('2024-02-29T09:00:00Z');
  const hasAfterUntil = originalOccurrences.some(
    date => date.getTime() > untilDate.getTime()
  );
  const hasAfterUntilResult = resultOccurrences.some(
    date => date.getTime() > untilDate.getTime()
  );

  console.log(`\nOccurrences after UNTIL date:`);
  console.log(`  Original: ${hasAfterUntil}`);
  console.log(`  Result: ${hasAfterUntilResult}`);

  assert(!hasAfterUntil, 'Original should respect UNTIL');
  assert(!hasAfterUntilResult, 'Result should respect UNTIL');

  // Check if occurrences match
  const occurrencesMatch =
    originalOccurrences.length === resultOccurrences.length &&
    originalOccurrences.every((date, index) => {
      const resultDate = resultOccurrences[index];
      return Math.abs(date.getTime() - resultDate.getTime()) < 1000;
    });

  assert(occurrencesMatch, 'Occurrences should match after round-trip');
}

/**
 * Test 1: Simple RRULE with single EXDATE
 */
function testSimpleRruleWithExdate(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z`;

  console.log('\nOriginal RRULE string:');
  console.log(originalRrule);

  // Parse with rrulestr
  const rule = rrulestr(originalRrule);
  console.log(`\nParsed rule type: ${rule.constructor.name}`);

  // Convert back to string
  const toStringResult = rule.toString();
  console.log('\nResult from .toString():');
  console.log(toStringResult);

  // Normalize both for comparison
  const normalizedOriginal = normalizeRruleString(originalRrule);
  const normalizedResult = normalizeRruleString(toStringResult);

  console.log('\nComparison:');
  console.log('Original (normalized):');
  console.log(normalizedOriginal);
  console.log('\nResult (normalized):');
  console.log(normalizedResult);

  // Check if they match exactly
  const exactMatch = normalizedOriginal === normalizedResult;
  console.log(`\nExact match? ${exactMatch}`);

  // Even if not exact, check if they produce the same occurrences
  const originalRule = rrulestr(originalRrule);
  const resultRule = rrulestr(toStringResult);

  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-02-29T23:59:59Z');

  const originalOccurrences = originalRule.between(startDate, endDate, true);
  const resultOccurrences = resultRule.between(startDate, endDate, true);

  console.log(`\nOriginal occurrences: ${originalOccurrences.length}`);
  console.log(`Result occurrences: ${resultOccurrences.length}`);

  // Check if occurrences match
  const occurrencesMatch =
    originalOccurrences.length === resultOccurrences.length &&
    originalOccurrences.every((date, index) => {
      const resultDate = resultOccurrences[index];
      return Math.abs(date.getTime() - resultDate.getTime()) < 1000;
    });

  console.log(`Occurrences match? ${occurrencesMatch}`);

  // The important thing is that occurrences match, not necessarily exact string match
  assert(occurrencesMatch, 'Occurrences should match after round-trip');
}

/**
 * Test 5: Compare string format differences
 */
function testStringFormatDifferences(): void {
  const originalRrule = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
EXDATE:20240108T090000Z
EXDATE:20240115T090000Z`;

  console.log('\nAnalyzing string format differences...');
  console.log('\nOriginal RRULE string:');
  console.log(originalRrule);

  const rule = rrulestr(originalRrule);
  const toStringResult = rule.toString();

  console.log('\nResult from .toString():');
  console.log(toStringResult);

  // Analyze differences
  const originalLines = originalRrule.split('\n').map(line => line.trim());
  const resultLines = toStringResult.split('\n').map(line => line.trim());

  console.log('\nLine-by-line comparison:');
  const maxLines = Math.max(originalLines.length, resultLines.length);

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || '(missing)';
    const resultLine = resultLines[i] || '(missing)';
    const match = originalLine === resultLine ? '✓' : '✗';

    console.log(`  ${match} Line ${i + 1}:`);
    console.log(`    Original: ${originalLine}`);
    console.log(`    Result:   ${resultLine}`);
  }

  // Check what properties are preserved
  console.log('\nKey properties check:');
  const hasDtstart = toStringResult.includes('DTSTART:');
  const hasRrule = toStringResult.includes('RRULE:');
  const hasExdate = toStringResult.includes('EXDATE:');

  console.log(`  Has DTSTART? ${hasDtstart}`);
  console.log(`  Has RRULE? ${hasRrule}`);
  console.log(`  Has EXDATE? ${hasExdate}`);

  assert(hasDtstart, 'Should preserve DTSTART');
  assert(hasRrule, 'Should preserve RRULE');
  assert(hasExdate, 'Should preserve EXDATE');
}

// Run tests
runAllTests();
