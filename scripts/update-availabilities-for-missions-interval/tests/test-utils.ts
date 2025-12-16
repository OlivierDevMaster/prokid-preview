import { RRule } from 'rrule';

/**
 * Simple test runner utilities
 */
export interface TestCase {
  fn: () => void;
  name: string;
}

export const tests: TestCase[] = [];
export const stats = { failed: 0, passed: 0 };

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertContains(
  str: string,
  substring: string,
  message?: string
) {
  if (!str.includes(substring)) {
    throw new Error(message || `Expected "${str}" to contain "${substring}"`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

export function assertGreaterThan(
  actual: number,
  expected: number,
  message?: string
) {
  if (actual <= expected) {
    throw new Error(
      message || `Expected ${actual} to be greater than ${expected}`
    );
  }
}

export function assertThrows(fn: () => void, expectedError?: string) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedError && !String(error).includes(expectedError)) {
      throw new Error(
        `Expected error to contain "${expectedError}", but got: ${error}`
      );
    }
  }
}

/**
 * Helper function to create a simple daily RRULE string
 */
export function createDailyRRULE(dtstart: Date, until: Date | null): string {
  const rrule = new RRule({
    dtstart,
    freq: RRule.DAILY,
    until: until || undefined,
  });
  return rrule.toString();
}

/**
 * Helper function to create a simple weekly RRULE string
 */
export function createWeeklyRRULE(
  dtstart: Date,
  until: Date | null,
  byday: string
): string {
  const weekdayMap: Record<string, number> = {
    FR: RRule.FR,
    MO: RRule.MO,
    SA: RRule.SA,
    SU: RRule.SU,
    TH: RRule.TH,
    TU: RRule.TU,
    WE: RRule.WE,
  };
  const rrule = new RRule({
    byweekday: [weekdayMap[byday]],
    dtstart,
    freq: RRule.WEEKLY,
    until: until || undefined,
  });
  return rrule.toString();
}

export function test(name: string, fn: () => void) {
  tests.push({ fn, name });
}

// Common test constants
export const missionStart = new Date('2024-01-08T00:00:00Z'); // Monday
export const missionEnd = new Date('2024-01-31T23:59:59Z'); // End of January
