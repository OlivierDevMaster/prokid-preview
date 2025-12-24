# RRULE Refactoring Plan

## Executive Summary

This document outlines recommendations for managing the complexity of our RRULE implementation for mission schedules and professional availabilities. After analysis, **we recommend keeping the `rrule` library** but refactoring our code to reduce complexity through better abstractions and organization.

## Current Situation Assessment

### What We Have

- **17 files** using the `rrule` library across the codebase
- **Complex validation logic** for mission schedules vs. availabilities
- **Manual RRULE string manipulation** (constraining, parsing, EXDATE handling)
- **Type checking** between `RRule` and `RRuleSet` scattered throughout
- **43 comprehensive test cases** covering edge cases
- **Complex coverage checking** logic for multi-availability scenarios

### Complexity Sources

1. **String Manipulation**: Manual parsing and reconstruction of RRULE strings
   - Extracting parseable parts (DTSTART, RRULE)
   - Removing/adding EXDATE lines
   - Constraining by date ranges

2. **Type Handling**: Inconsistent handling of `RRule` vs `RRuleSet`
   - Multiple `instanceof` checks scattered across code
   - Duplicate logic for extracting `dtstart` and `until`
   - Different code paths for RRule vs RRuleSet

3. **Coverage Logic**: Complex algorithm for checking if missions fit within availabilities
   - Overlapping time range calculations
   - Multi-availability coverage checking
   - Gap detection

4. **Code Duplication**: Similar patterns repeated in multiple files
   - Date extraction logic duplicated
   - RRULE parsing patterns repeated
   - Constraint logic duplicated

## Recommendation: Keep RRULE, Refactor Implementation

### Why Keep RRULE?

1. **RFC 5545 Standard**: Industry-standard format, widely supported and interoperable
2. **Already Integrated**: 17 files, extensive test coverage (43 tests)
3. **Handles Complex Patterns**: Supports all the patterns we need:
   - BYMONTH, BYWEEKDAY, BYMONTHDAY, etc.
   - EXDATE exceptions
   - UNTIL constraints
   - Complex frequency patterns
4. **Well-Maintained**: Active library with good community support
5. **Migration Cost**: Switching would require rewriting all 17 files and 43 tests

### The Real Problem

The complexity isn't from the library itself, but from:
- Lack of abstraction layers
- Scattered logic across multiple files
- Direct manipulation of RRULE strings
- Inconsistent type handling

## Proposed Refactoring Strategy

### 1. Create Abstraction Layers

Wrap rrule complexity behind simpler, domain-specific interfaces.

#### 1.1 ScheduleRule Wrapper Class

Create a unified interface that handles both `RRule` and `RRuleSet` transparently:

```typescript
// lib/scheduling/schedule-rule.ts

import { RRule, RRuleSet, rrulestr } from 'rrule';

/**
 * Unified wrapper for RRule and RRuleSet that provides a consistent API
 * regardless of the underlying type.
 */
export class ScheduleRule {
  private rule: RRule | RRuleSet;
  private isRuleSet: boolean;

  constructor(rruleString: string) {
    this.rule = rrulestr(rruleString);
    this.isRuleSet = this.rule instanceof RRuleSet ||
                     typeof (this.rule as RRuleSet).rrules === 'function';
  }

  /**
   * Get all occurrences between start and end dates (inclusive)
   */
  getOccurrences(start: Date, end: Date): Date[] {
    return this.rule.between(start, end, true);
  }

  /**
   * Get the DTSTART date from the rule
   */
  getDtstart(): Date | null {
    if (this.isRuleSet) {
      const rruleSet = this.rule as RRuleSet;
      const rules = rruleSet.rrules();
      if (rules.length > 0) {
        return rules[0].options.dtstart || null;
      }
      return null;
    }
    return (this.rule as RRule).options.dtstart || null;
  }

  /**
   * Get the UNTIL date from the rule
   */
  getUntil(): Date | null {
    if (this.isRuleSet) {
      const rruleSet = this.rule as RRuleSet;
      const rules = rruleSet.rrules();
      let maxUntil: Date | null = null;
      for (const r of rules) {
        if (r.options.until) {
          if (!maxUntil || r.options.until > maxUntil) {
            maxUntil = r.options.until;
          }
        }
      }
      return maxUntil;
    }
    return (this.rule as RRule).options.until || null;
  }

  /**
   * Get the original RRULE string
   */
  toString(): string {
    return this.rule.toString();
  }

  /**
   * Constrain this rule by new date boundaries
   * Preserves time from original DTSTART and EXDATE exceptions
   */
  constrainByDates(missionStart: Date, missionEnd: Date): ScheduleRule {
    const constrainedString = constrainRRULEByDates(
      this.toString(),
      missionStart,
      missionEnd
    );
    return new ScheduleRule(constrainedString);
  }

  /**
   * Check if this rule has EXDATE exceptions
   */
  hasExceptions(): boolean {
    return this.isRuleSet;
  }
}
```

#### 1.2 Unified Types

Create domain-specific types that hide rrule implementation details:

```typescript
// lib/scheduling/types.ts

/**
 * Represents a parsed schedule with unified interface
 */
export interface ParsedSchedule {
  dtstart: Date | null;
  until: Date | null;
  getOccurrences(start: Date, end: Date): Date[];
  toString(): string;
}

/**
 * Mission schedule with duration
 */
export interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

/**
 * Professional availability with duration
 */
export interface ProfessionalAvailability {
  duration_mn: number;
  rrule: string;
}

/**
 * Time range for coverage checking
 */
export interface TimeRange {
  start: Date;
  end: Date;
}
```

### 2. Extract Coverage Logic

Move complex coverage checking into a dedicated, testable module:

```typescript
// lib/scheduling/coverage-checker.ts

import { ScheduleRule } from './schedule-rule';
import { ProfessionalAvailability, TimeRange } from './types';

/**
 * Checks if a mission occurrence is fully covered by availability occurrences.
 * Handles single availability coverage and multi-availability coverage with gaps.
 */
export class CoverageChecker {
  /**
   * Check if a mission occurrence is fully covered by availabilities
   */
  checkMissionCoverage(
    missionOcc: Date,
    missionDurationMn: number,
    availabilities: ProfessionalAvailability[],
    dateRange: TimeRange
  ): boolean {
    const missionOccEnd = new Date(
      missionOcc.getTime() + missionDurationMn * 60 * 1000
    );

    // Collect all overlapping availability time ranges
    const overlappingRanges = this.collectOverlappingRanges(
      missionOcc,
      missionOccEnd,
      availabilities,
      dateRange
    );

    if (overlappingRanges.length === 0) {
      return false;
    }

    // Check if overlapping ranges fully cover the mission
    return this.rangesFullyCover(
      { start: missionOcc, end: missionOccEnd },
      overlappingRanges
    );
  }

  /**
   * Collect all availability time ranges that overlap with mission occurrence
   */
  private collectOverlappingRanges(
    missionStart: Date,
    missionEnd: Date,
    availabilities: ProfessionalAvailability[],
    dateRange: TimeRange
  ): TimeRange[] {
    const overlappingRanges: TimeRange[] = [];

    for (const availability of availabilities) {
      try {
        const scheduleRule = new ScheduleRule(availability.rrule);
        const occurrences = scheduleRule.getOccurrences(
          dateRange.start,
          dateRange.end
        );

        for (const availOcc of occurrences) {
          const availOccEnd = new Date(
            availOcc.getTime() + availability.duration_mn * 60 * 1000
          );

          // Check for overlap
          if (
            missionStart.getTime() < availOccEnd.getTime() &&
            missionEnd.getTime() > availOcc.getTime()
          ) {
            // Extract overlapping portion
            overlappingRanges.push({
              start: new Date(
                Math.max(missionStart.getTime(), availOcc.getTime())
              ),
              end: new Date(
                Math.min(missionEnd.getTime(), availOccEnd.getTime())
              ),
            });
          }
        }
      } catch (error) {
        // Skip invalid availability RRULEs
        console.error('Error parsing availability RRULE:', error, availability);
        continue;
      }
    }

    // Sort by start time
    overlappingRanges.sort((a, b) => a.start.getTime() - b.start.getTime());
    return overlappingRanges;
  }

  /**
   * Check if a set of ranges fully covers a target range without gaps
   */
  private rangesFullyCover(
    target: TimeRange,
    ranges: TimeRange[]
  ): boolean {
    let coveredStart = target.start.getTime();
    const targetEnd = target.end.getTime();

    for (const range of ranges) {
      // If this range starts after what we've covered, there's a gap
      if (range.start.getTime() > coveredStart) {
        return false;
      }

      // Extend covered area if this range goes further
      if (range.end.getTime() > coveredStart) {
        coveredStart = range.end.getTime();
      }

      // If we've covered the entire target, we're done
      if (coveredStart >= targetEnd) {
        return true;
      }
    }

    return coveredStart >= targetEnd;
  }
}
```

### 3. Centralize Constraint Utilities

Move all RRULE string manipulation into a single, well-tested utility:

```typescript
// lib/scheduling/constraint-utils.ts

import { RRule, rrulestr } from 'rrule';

/**
 * Constrains an RRULE by mission start and end dates.
 * Extracts the time from the RRULE's DTSTART and applies it to the mission date range.
 * Preserves EXDATE exceptions and ensures UNTIL is set.
 */
export function constrainRRULEByDates(
  rrule: string,
  missionDtstart: Date,
  missionUntil: Date
): string {
  // Extract parseable parts (DTSTART and RRULE lines)
  const parseableRRULE = extractParseableRRULE(rrule);
  const rule = rrulestr(parseableRRULE);

  // Extract time components from RRULE's DTSTART
  const originalDtstart = rule.options.dtstart || new Date();
  const hour = originalDtstart.getUTCHours();
  const minute = originalDtstart.getUTCMinutes();
  const second = originalDtstart.getUTCSeconds();

  // Create new DTSTART: mission start date with original time
  const newDtstart = new Date(missionDtstart);
  newDtstart.setUTCHours(hour, minute, second, 0);

  // Create new UNTIL: mission end date with original time
  const newUntil = new Date(missionUntil);
  newUntil.setUTCHours(hour, minute, second, 0);

  // Build RRULE options from original pattern
  const rruleOptions: RRule.Options = {
    bymonth: rule.options.bymonth,
    bymonthday: rule.options.bymonthday,
    bysetpos: rule.options.bysetpos,
    byweekday: rule.options.byweekday,
    byweekno: rule.options.byweekno,
    byyearday: rule.options.byyearday,
    dtstart: newDtstart,
    freq: rule.options.freq,
    interval: rule.options.interval,
    until: newUntil,
    wkst: rule.options.wkst,
  };

  // Remove bysetpos if present (can conflict with UNTIL when modifying DTSTART)
  delete rruleOptions.bysetpos;

  // Create new RRULE with mission date constraints
  const newRRule = new RRule(rruleOptions);
  const formattedRRULE = newRRule.toString();

  // Preserve EXDATE from original RRULE
  const exdateLines = extractEXDATELines(rrule);
  if (exdateLines.length > 0) {
    return formattedRRULE + '\n' + exdateLines.join('\n');
  }

  return formattedRRULE;
}

/**
 * Extracts parseable parts of an RRULE string (DTSTART and RRULE lines)
 */
function extractParseableRRULE(rruleString: string): string {
  const lines = rruleString.split('\n');
  const parseableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DTSTART:') || trimmed.startsWith('RRULE:')) {
      parseableLines.push(trimmed);
    }
  }

  return parseableLines.join('\n');
}

/**
 * Extracts EXDATE lines from an RRULE string
 */
function extractEXDATELines(rruleString: string): string[] {
  const lines = rruleString.split('\n');
  const exdateLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('EXDATE:')) {
      exdateLines.push(trimmed);
    }
  }

  return exdateLines;
}
```

### 4. Refactored Validation Function

With the new abstractions, the validation function becomes much simpler:

```typescript
// lib/scheduling/mission-validator.ts

import { ScheduleRule } from './schedule-rule';
import { CoverageChecker } from './coverage-checker';
import { MissionSchedule, ProfessionalAvailability, ValidationResult, ValidationViolation } from './types';

export class MissionValidator {
  private coverageChecker: CoverageChecker;

  constructor() {
    this.coverageChecker = new CoverageChecker();
  }

  /**
   * Validates that all mission schedule occurrences fall within
   * at least one professional availability.
   */
  validateMissionAvailability(
    missionSchedules: MissionSchedule[],
    missionDtstart: Date,
    missionUntil: Date,
    availabilities: ProfessionalAvailability[]
  ): ValidationResult {
    this.validateMissionDateRange(missionDtstart, missionUntil);

    const violations: ValidationViolation[] = [];

    for (let i = 0; i < missionSchedules.length; i++) {
      const schedule = missionSchedules[i];
      const scheduleViolations = this.validateSchedule(
        schedule,
        i,
        missionDtstart,
        missionUntil,
        availabilities
      );
      violations.push(...scheduleViolations);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  private validateSchedule(
    schedule: MissionSchedule,
    scheduleIndex: number,
    missionDtstart: Date,
    missionUntil: Date,
    availabilities: ProfessionalAvailability[]
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    try {
      // Constrain the schedule by mission dates
      const scheduleRule = new ScheduleRule(schedule.rrule);
      const constrainedRule = scheduleRule.constrainByDates(
        missionDtstart,
        missionUntil
      );

      // Get all mission occurrences
      const missionOccurrences = constrainedRule.getOccurrences(
        missionDtstart,
        missionUntil
      );

      // Check each occurrence
      for (const missionOcc of missionOccurrences) {
        const isCovered = this.coverageChecker.checkMissionCoverage(
          missionOcc,
          schedule.duration_mn,
          availabilities,
          { start: missionDtstart, end: missionUntil }
        );

        if (!isCovered) {
          const missionOccEnd = new Date(
            missionOcc.getTime() + schedule.duration_mn * 60 * 1000
          );

          violations.push({
            mission_occurrence_start: missionOcc.toISOString(),
            mission_occurrence_end: missionOccEnd.toISOString(),
            mission_schedule_index: scheduleIndex,
            reason: `Mission occurrence from ${missionOcc.toISOString()} to ${missionOccEnd.toISOString()} is not covered by any professional availability`,
          });
        }
      }
    } catch (error) {
      throw new Error(
        `Invalid RRULE in mission schedule at index ${scheduleIndex}: ${String(error)}`
      );
    }

    return violations;
  }

  private validateMissionDateRange(
    missionDtstart: Date,
    missionUntil: Date
  ): void {
    if (isNaN(missionDtstart.getTime()) || isNaN(missionUntil.getTime())) {
      throw new Error('Invalid mission date range');
    }

    if (missionUntil <= missionDtstart) {
      throw new Error('Mission end date must be after start date');
    }
  }
}
```

## Proposed File Structure

```
lib/scheduling/
├── schedule-rule.ts          # ScheduleRule wrapper class
├── coverage-checker.ts       # Coverage validation logic
├── constraint-utils.ts       # RRULE constraint utilities
├── mission-validator.ts     # Main validation class
├── types.ts                  # Unified types and interfaces
└── index.ts                  # Public exports

# Migration path:
scripts/missions-availability/
├── validateMissionAvailability.ts  # (deprecated, use lib/scheduling)
└── ...

supabase/functions/_shared/utils/
├── rrule-generator.ts        # (refactor to use lib/scheduling)
└── ...
```

## Migration Strategy

### Phase 1: Create New Abstractions (Non-Breaking)

1. Create `lib/scheduling/` directory structure
2. Implement `ScheduleRule`, `CoverageChecker`, `constraint-utils`
3. Write comprehensive tests for new abstractions
4. Keep existing code working

### Phase 2: Migrate Validation Logic

1. Implement `MissionValidator` using new abstractions
2. Update `validateMissionAvailability.ts` to use new validator internally
3. Run all 43 existing tests to ensure compatibility
4. Gradually migrate other files to use new abstractions

### Phase 3: Consolidate and Clean Up

1. Update all 17 files to use new abstractions
2. Remove duplicate code
3. Remove deprecated functions
4. Update documentation

## Benefits of This Approach

1. **Reduced Complexity**: Abstractions hide rrule implementation details
2. **Better Testability**: Each component can be tested independently
3. **Type Safety**: Unified types prevent `RRule` vs `RRuleSet` confusion
4. **Maintainability**: Changes to rrule handling are centralized
5. **Reusability**: Abstractions can be used across all 17 files
6. **Backward Compatible**: Can migrate gradually without breaking changes

## Alternative Libraries (For Reference)

### 1. `later` Library

**Pros:**
- Simpler API
- Easier to understand for basic cases

**Cons:**
- Not RFC 5545 standard
- Less feature-complete
- Would require full rewrite of 17 files and 43 tests
- Less interoperable

**Verdict:** Not recommended - migration cost too high, less standard

### 2. `node-schedule` (Cron-like)

**Pros:**
- Very simple for basic scheduling

**Cons:**
- Not suitable for complex availability patterns
- Doesn't support EXDATE, complex BY* modifiers
- Would require significant custom logic

**Verdict:** Not suitable for our use case

### 3. Custom Solution with `date-fns`/`luxon`

**Pros:**
- Full control
- No external dependencies for scheduling logic

**Cons:**
- Would need to rebuild all RRULE functionality from scratch
- High development and maintenance cost
- Risk of bugs in complex edge cases
- Would lose RFC 5545 compatibility

**Verdict:** Not recommended - too much work, too much risk

## Third-Party Services (Not Recommended)

### Services Like Calendly API, Google Calendar API

**Pros:**
- Managed service
- No need to maintain scheduling logic

**Cons:**
- **Vendor Lock-in**: Hard to migrate away
- **Cost**: Ongoing subscription fees
- **Data Privacy**: Sending scheduling data to third parties
- **Less Control**: Can't customize behavior
- **Still Need Validation**: Would still need complex validation logic
- **API Limitations**: May not support all our use cases
- **Network Dependency**: Requires internet, adds latency

**Verdict:** Not recommended for our use case

## Implementation Checklist

When ready to implement, follow this checklist:

### Phase 1: Foundation
- [ ] Create `lib/scheduling/` directory
- [ ] Implement `types.ts` with unified interfaces
- [ ] Implement `constraint-utils.ts` with tests
- [ ] Implement `ScheduleRule` class with tests
- [ ] Ensure all existing tests still pass

### Phase 2: Core Logic
- [ ] Implement `CoverageChecker` class with tests
- [ ] Implement `MissionValidator` class
- [ ] Migrate `validateMissionAvailability.ts` to use new validator
- [ ] Run all 43 existing tests to verify compatibility
- [ ] Update documentation

### Phase 3: Migration
- [ ] Update `supabase/functions/_shared/utils/rrule-generator.ts`
- [ ] Update `supabase/functions/extract-rrule-dates/handlers/extractRruleDatesHandler.ts`
- [ ] Update `supabase/functions/missions/handlers/createMissionHandler.ts`
- [ ] Update `supabase/functions/missions/handlers/acceptMissionHandler.ts`
- [ ] Update `supabase/functions/availabilities/handlers/getAvailabilitySlotsHandler.ts`
- [ ] Update all other files using rrule (17 total)
- [ ] Remove duplicate code
- [ ] Update all tests

### Phase 4: Cleanup
- [ ] Remove deprecated functions
- [ ] Update all documentation
- [ ] Code review
- [ ] Performance testing
- [ ] Final integration testing

## Notes

- **Keep Existing Tests**: All 43 existing tests should continue to pass
- **Gradual Migration**: No need to migrate everything at once
- **Backward Compatibility**: Maintain existing function signatures during migration
- **Documentation**: Update as you go
- **Code Review**: Review each phase before moving to next

## Questions to Consider

1. Should we create a migration script to help with Phase 3?
2. Do we want to add more comprehensive error handling in the abstractions?
3. Should we add performance monitoring for large-scale scenarios?
4. Do we want to add caching for frequently accessed schedules?

## Conclusion

The `rrule` library is the right choice for our use case. The complexity comes from our implementation, not the library. By creating proper abstractions and organizing our code better, we can significantly reduce complexity while keeping all the benefits of RFC 5545 standard scheduling.

This refactoring will make the codebase more maintainable, testable, and easier to understand, without requiring a complete rewrite or migration to a different library or service.

