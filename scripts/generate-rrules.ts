import { RRule, RRuleSet, rrulestr, Weekday } from 'rrule';

/**
 * Script to generate RRULE strings similar to those in the seeders
 * Demonstrates one example for each type of rule pattern
 */

// Map day numbers to RRule day constants
const DAY_MAP: Record<number, Weekday> = {
  0: RRule.SU, // Sunday
  1: RRule.MO, // Monday
  2: RRule.TU, // Tuesday
  3: RRule.WE, // Wednesday
  4: RRule.TH, // Thursday
  5: RRule.FR, // Friday
  6: RRule.SA, // Saturday
};

/**
 * Test result tracking
 */
interface TestResult {
  details?: string;
  error?: string;
  name: string;
  passed: boolean;
}

/**
 * Test assertion helper
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Type 3: One-time availability (no recurrence)
 * Example: Special Saturday session
 */
function createOneTimeRule(date: Date, hour: number): string {
  const dtstart = new Date(date);
  dtstart.setUTCHours(hour, 0, 0, 0);

  const rrule = new RRule({
    count: 1,
    dtstart: dtstart,
    freq: RRule.DAILY,
  });

  return rrule.toString();
}

/**
 * Type 1: Weekly recurring availability (no exceptions)
 * Example: Monday 2pm-6pm weekly
 */
function createWeeklyRecurringRule(
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
  hour: number,
  startDate: Date = new Date()
): string {
  const dtstart = new Date(startDate);
  dtstart.setUTCHours(hour, 0, 0, 0);

  // Find the next occurrence of the specified day
  const dayOffset = (dayOfWeek - dtstart.getUTCDay() + 7) % 7;
  if (dayOffset > 0) {
    dtstart.setUTCDate(dtstart.getUTCDate() + dayOffset);
  }

  const rrule = new RRule({
    byweekday: [DAY_MAP[dayOfWeek]],
    dtstart: dtstart,
    freq: RRule.WEEKLY,
  });

  return rrule.toString();
}

/**
 * Type 2: Weekly recurring availability with EXDATE (exceptions)
 * Example: Monday 9am-12pm, not available on specific Mondays
 */
function createWeeklyRecurringWithExceptions(
  dayOfWeek: number,
  hour: number,
  exceptionDates: Date[],
  startDate: Date = new Date()
): string {
  const dtstart = new Date(startDate);
  dtstart.setUTCHours(hour, 0, 0, 0);

  // Find the next occurrence of the specified day
  const dayOffset = (dayOfWeek - dtstart.getUTCDay() + 7) % 7;
  if (dayOffset > 0) {
    dtstart.setUTCDate(dtstart.getUTCDate() + dayOffset);
  }

  const rrule = new RRule({
    byweekday: [DAY_MAP[dayOfWeek]],
    dtstart: dtstart,
    freq: RRule.WEEKLY,
  });

  const rruleSet = new RRuleSet();
  rruleSet.rrule(rrule);

  // Add exdate dates
  exceptionDates.forEach(date => {
    const exdate = new Date(date);
    exdate.setUTCHours(hour, 0, 0, 0);
    rruleSet.exdate(exdate);
  });

  return rruleSet.toString();
}

/**
 * Parse an RRULE string and get the next N occurrences
 * Note: The correct RRULE format uses newlines (as returned by .toString()).
 * The seeders use semicolons which is incorrect, but we're not updating them yet.
 */
function parseAndGetDates(rruleString: string, count: number = 10): Date[] {
  try {
    const rule = rrulestr(rruleString);
    const now = new Date();
    const occurrences = rule.between(
      now,
      new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      true
    );
    return occurrences.slice(0, count);
  } catch (error) {
    throw new Error(`Failed to parse RRULE: ${error}`);
  }
}

const testResults: TestResult[] = [];

/**
 * Run all tests
 */
function runAllTests(): void {
  console.log('Running RRULE generation tests...\n');

  runTest('Weekly Recurring Rule', testWeeklyRecurringRule);
  runTest(
    'Weekly Recurring Rule with EXDATE',
    testWeeklyRecurringWithExceptions
  );
  runTest('One-time Rule', testOneTimeRule);
  runTest('RRULE String Format', testRRuleStringFormat);

  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  console.log(`Passed: ${passed}/${testResults.length}`);
  console.log(`Failed: ${failed}/${testResults.length}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nAll tests passed! ✓');
  }
}

function runTest(name: string, testFn: () => void): void {
  try {
    testFn();
    testResults.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    testResults.push({ error: errorMessage, name, passed: false });
    console.error(`✗ ${name}: ${errorMessage}`);
  }
}

/**
 * Test: One-time rule
 */
function testOneTimeRule(): void {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getUTCDay() + 7) % 7 || 7;
  const saturdayDate = new Date(today);
  saturdayDate.setUTCDate(today.getUTCDate() + daysUntilSaturday);
  const hour = 10; // 10am

  const rruleString = createOneTimeRule(saturdayDate, hour);
  console.log('\nGenerated RRULE string:');
  console.log(rruleString);

  const occurrences = parseAndGetDates(rruleString, 10);
  console.log('\nGenerated dates (should be only 1):');
  occurrences.forEach((date, index) => {
    console.log(
      `  ${index + 1}. ${date.toISOString()} (${date.toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'long',
          weekday: 'long',
          year: 'numeric',
        }
      )})`
    );
  });

  assert(occurrences.length === 1, 'Should generate exactly 1 occurrence');
  assert(occurrences[0].getUTCDay() === 6, 'Occurrence should be on Saturday');
  assert(
    occurrences[0].getUTCHours() === hour,
    'Occurrence should be at the specified hour'
  );
}

/**
 * Test: RRULE string format validation
 */
function testRRuleStringFormat(): void {
  const today = new Date();
  const rruleString = createWeeklyRecurringRule(1, 14, today);
  console.log('\nGenerated RRULE string:');
  console.log(rruleString);

  assert(
    rruleString.includes('DTSTART:'),
    'RRULE string should contain DTSTART'
  );
  assert(rruleString.includes('RRULE:'), 'RRULE string should contain RRULE');
  assert(
    rruleString.includes('FREQ=WEEKLY'),
    'RRULE string should contain FREQ=WEEKLY'
  );
  assert(
    rruleString.includes('BYDAY=MO'),
    'RRULE string should contain BYDAY=MO'
  );
}

/**
 * Test: Weekly recurring rule
 */
function testWeeklyRecurringRule(): void {
  const today = new Date();
  const dayOfWeek = 1; // Monday
  const hour = 14; // 2pm

  const rruleString = createWeeklyRecurringRule(dayOfWeek, hour, today);
  console.log('\nGenerated RRULE string:');
  console.log(rruleString);

  const occurrences = parseAndGetDates(rruleString, 5);
  console.log('\nGenerated dates:');
  occurrences.forEach((date, index) => {
    console.log(
      `  ${index + 1}. ${date.toISOString()} (${date.toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'long',
          weekday: 'long',
          year: 'numeric',
        }
      )})`
    );
  });

  assert(occurrences.length === 5, 'Should generate 5 occurrences');
  assert(
    occurrences.every(date => date.getUTCDay() === dayOfWeek),
    'All occurrences should be on the specified day of week'
  );
  assert(
    occurrences.every(date => date.getUTCHours() === hour),
    'All occurrences should be at the specified hour'
  );

  // Verify weekly pattern
  for (let i = 1; i < occurrences.length; i++) {
    const daysDiff =
      (occurrences[i].getTime() - occurrences[i - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    assert(
      Math.abs(daysDiff - 7) < 1,
      `Occurrences should be approximately 7 days apart, got ${daysDiff}`
    );
  }
}

/**
 * Test: Weekly recurring rule with EXDATE
 */
function testWeeklyRecurringWithExceptions(): void {
  const today = new Date();
  const dayOfWeek = 1; // Monday
  const hour = 9; // 9am

  // Get actual occurrences to use as exceptions
  const tempRule = createWeeklyRecurringRule(dayOfWeek, hour, today);
  const tempDates = parseAndGetDates(tempRule, 10);
  const exceptionDate1 = tempDates[2]; // 3rd Monday
  const exceptionDate2 = tempDates[3]; // 4th Monday

  const rruleString = createWeeklyRecurringWithExceptions(
    dayOfWeek,
    hour,
    [exceptionDate1, exceptionDate2],
    today
  );
  console.log('\nGenerated RRULE string:');
  console.log(rruleString);
  console.log(
    `\nException dates (should be excluded): ${exceptionDate1.toISOString()}, ${exceptionDate2.toISOString()}`
  );

  const occurrences = parseAndGetDates(rruleString, 10);
  console.log('\nGenerated dates (should exclude exceptions):');
  occurrences.slice(0, 5).forEach((date, index) => {
    console.log(
      `  ${index + 1}. ${date.toISOString()} (${date.toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'long',
          weekday: 'long',
          year: 'numeric',
        }
      )})`
    );
  });

  assert(occurrences.length > 0, 'Should generate at least one occurrence');

  // Verify exceptions are excluded
  const exception1Time = exceptionDate1.getTime();
  const exception2Time = exceptionDate2.getTime();

  const hasException1 = occurrences.some(
    date => Math.abs(date.getTime() - exception1Time) < 1000
  );
  const hasException2 = occurrences.some(
    date => Math.abs(date.getTime() - exception2Time) < 1000
  );

  assert(!hasException1, 'Exception date 1 should be excluded');
  assert(!hasException2, 'Exception date 2 should be excluded');

  // Verify all occurrences are on the correct day and hour
  assert(
    occurrences.every(date => date.getUTCDay() === dayOfWeek),
    'All occurrences should be on the specified day of week'
  );
  assert(
    occurrences.every(date => date.getUTCHours() === hour),
    'All occurrences should be at the specified hour'
  );
}

// Run tests
runAllTests();

// Export functions for use in other scripts
export {
  createOneTimeRule,
  createWeeklyRecurringRule,
  createWeeklyRecurringWithExceptions,
};
