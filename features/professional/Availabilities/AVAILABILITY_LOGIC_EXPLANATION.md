# Availability Save Logic Explanation

## Overview

This document explains the logic in `saveWeekAvailabilities` function (lines 315-633) that handles saving weekly availability schedules. The code manages the complex relationship between **recurring availabilities** (weekly patterns) and **one-time availabilities** (single occurrences) for a specific week.

## Context

Before the code section (lines 315-633), the function:

- Fetches all recurring availabilities (with `FREQ=WEEKLY` in RRULE)
- Fetches all one-time availabilities (with `COUNT=1` in RRULE)
- Processes each day of the week (Monday through Sunday)
- Filters recurring availabilities that apply to the current day
- Filters out deleted slots to get active slots

## Main Logic Flow (Lines 315-633)

The code performs two main operations:

1. **Exclude recurring availabilities that are no longer in the schedule** (lines 315-377)
2. **Create one-time or recurring availabilities for new slots** (lines 379-632)

---

## Part 1: Excluding Recurring Availabilities (Lines 315-377)

### Purpose

When a user removes a slot from their schedule that was previously part of a recurring availability, we need to exclude that specific date from the recurrence pattern (using EXDATE in RRULE) rather than deleting the entire recurrence.

### Process

#### Step 1: Extract Recurring Slot Information

For each recurring availability that applies to the current day:

1. **Parse RRULE** to get the start time (DTSTART)
   - Try to parse using `rrulestr()` and extract `rule.options.dtstart`
   - If that fails, fallback to regex extraction: `/DTSTART:(\d{8})T(\d{2})(\d{2})/`
   - Convert time to minutes: `hours * 60 + minutes`

2. **Get duration** from `recurring.duration_mn`

#### Step 2: Check if Slot Exists in New Schedule

- Compare the recurring slot's start time and duration with all new slots
- **Matching criteria:**
  - Start time difference ≤ 15 minutes (tolerance)
  - Duration must match exactly

#### Step 3: Exclude if Not Found

If no matching slot is found in the new schedule:

1. **Check if already excluded:**
   - If RRULE is an `RRuleSet`, check existing EXDATEs
   - Compare target date (date only, ignoring time) with existing EXDATEs
   - Skip if already excluded

2. **Add EXDATE:**
   - Add the recurring availability ID to `recurringToExclude` array
   - Call `addExdateForDay()` to add EXDATE to the RRULE

#### Error Handling

- If RRULE parsing fails, skip that recurring availability (continue to next)

---

## Part 2: Creating Availabilities for New Slots (Lines 379-632)

### Purpose

For each active slot in the new schedule, determine whether to:

- Create a new recurring availability (if slot is marked as recurring)
- Create a one-time availability (if slot is not recurring and doesn't match existing recurrence)
- Do nothing (if slot already exists as a recurrence or one-time)

### Process for Each Slot

#### Step 1: Calculate Slot Properties

- `startMinutes`: Convert slot start time to minutes
- `durationMinutes`: Calculate duration from start to end time
- `slotDate`: Create Date object with slot's date and time

#### Step 2: Check if Slot Matches Existing Recurring Availability (Lines 394-479)

This is critical: **if a slot matches an existing recurrence, we should NOT create a one-time availability**.

For each recurring availability (that wasn't marked for exclusion):

1. **Skip if marked for exclusion:**
   - If recurring ID is in `recurringToExclude`, skip it

2. **Check if date is excluded via EXDATE:**
   - If RRULE is an `RRuleSet`, check `rule.exdates()`
   - Otherwise, check EXDATE in RRULE string using regex: `/EXDATE:([^\n]+)/`
   - If date is excluded, this slot should be created as one-time (return `false`)

3. **Extract recurring slot's start time:**
   - Try `rule.options.dtstart`
   - Fallback to regex: `/DTSTART:(\d{8})T(\d{2})(\d{2})/`
   - Convert to minutes

4. **Compare time and duration:**
   - Time difference ≤ 15 minutes
   - Duration matches exactly
   - If both match, return `true` (slot matches recurring)

5. **Error handling:**
   - If parsing fails, fallback to regex matching
   - Check EXDATE in string format
   - Compare time and duration

**Result:** `matchesRecurring` boolean indicates if slot matches an existing recurrence

#### Step 3: Handle Recurring Slots (Lines 481-536)

If `slot.recurring === true` and `!matchesRecurring`:

1. **Check if recurring already exists:**
   - Search `recurringForDay` for matching recurring availability
   - Match by time (≤15 min difference) and duration

2. **Create new recurring availability:**
   - If no existing recurring found, create using RRule library
   - Create Date object with local time, use RRule to generate RRULE string
   - Insert directly into database
   - Skip creating one-time availability (continue to next slot)

#### Step 4: Handle One-Time Slots (Lines 538-631)

If `!matchesRecurring && !slotShouldBeRecurring`:

1. **Check if one-time availability already exists:**
   - Search `oneTimeAvailabilities` array
   - Extract `dtstart` from RRULE:
     - Try parsing with `rrulestr()` → `rule.options.dtstart`
     - Fallback to regex: `/DTSTART:(\d{8})T(\d{2})(\d{2})(\d{2})?/`
     - If still null, try `oneTime.dtstart` from database
   - Check if within week range (between `weekStart` and `weekEnd`)
   - Compare date/time (≤15 min tolerance) and duration

2. **Create one-time availability:**
   - If doesn't exist, create using RRule library
   - Create Date object with local time, use RRule to generate RRULE string (DAILY with COUNT=1)
   - Insert directly into database

---

## All Cases Handled

### Case 1: Recurring Slot Removed from Schedule

**Scenario:** User had a recurring Monday 9:00 AM slot, removes it from this week's schedule.

**Action:**

- Recurring availability still exists in database
- Add EXDATE for this specific Monday to the RRULE
- Recurring continues for other Mondays

**Code:** Lines 315-377

---

### Case 2: Recurring Slot Still in Schedule

**Scenario:** User has a recurring Monday 9:00 AM slot, keeps it in this week's schedule.

**Action:**

- No changes needed
- Slot is covered by existing recurrence

**Code:** Lines 343-346 (matchingSlot found, no exclusion)

---

### Case 3: New Recurring Slot Added

**Scenario:** User adds a new slot marked as recurring (e.g., Tuesday 2:00 PM).

**Action:**

- Check if recurring already exists for this day/time
- If not, create new recurring availability
- Skip creating one-time availability

**Code:** Lines 485-535

---

### Case 4: New One-Time Slot Added

**Scenario:** User adds a slot NOT marked as recurring (e.g., Wednesday 10:00 AM for this week only).

**Action:**

- Check if it matches existing recurrence (should not)
- Check if one-time availability already exists
- If not, create new one-time availability

**Code:** Lines 542-631

---

### Case 5: Slot Matches Existing Recurrence (Not Excluded)

**Scenario:** User has a recurring Monday 9:00 AM, and this week's schedule also has Monday 9:00 AM.

**Action:**

- `matchesRecurring = true`
- Do NOT create one-time availability
- Slot is already covered by recurrence

**Code:** Lines 394-479, 542 (condition prevents creation)

---

### Case 6: Slot Matches Recurrence But Date is Excluded

**Scenario:** User excluded a recurring Monday 9:00 AM for this week (via EXDATE), but now adds it back to schedule.

**Action:**

- `matchesRecurring = false` (because date is excluded)
- `slotShouldBeRecurring = false` (slot not marked as recurring)
- Create one-time availability for this specific date

**Code:** Lines 404-425 (isExcluded check returns false, preventing match)

---

### Case 7: Recurring Slot Already Excluded

**Scenario:** A recurring availability was already excluded for this date (EXDATE exists).

**Action:**

- Check `isAlreadyExcluded` before adding EXDATE
- Skip if already excluded (avoid duplicate EXDATEs)

**Code:** Lines 351-361

---

### Case 8: Multiple Recurring Availabilities for Same Day

**Scenario:** User has multiple recurring availabilities on Monday (e.g., 9:00 AM and 2:00 PM).

**Action:**

- Process each recurring separately
- Check each against new schedule slots
- Exclude only those not found in new schedule

**Code:** Lines 317-377 (loop through all recurringForDay)

---

### Case 9: Slot Time Slightly Different (Within Tolerance)

**Scenario:** Recurring slot is 9:00 AM, new schedule has 9:05 AM.

**Action:**

- 5-minute difference ≤ 15-minute tolerance
- Considered a match
- No new availability created

**Code:** Lines 344-345, 441-442, 450-451 (timeDiff ≤ 15)

---

### Case 10: RRULE Parsing Fails

**Scenario:** RRULE string is malformed or in unexpected format.

**Action:**

- Try parsing with `rrulestr()`
- If fails, fallback to regex extraction
- If regex fails, skip that recurring (continue to next)

**Code:** Lines 373-376, 452-478 (try-catch blocks)

---

### Case 11: Day Disabled or No Active Slots

**Scenario:** User disables a day or removes all slots.

**Action:**

- (Handled before line 315)
- All recurring availabilities for that day are excluded
- No new availabilities created

**Code:** Lines 283-294 (before the section we're analyzing)

---

### Case 12: One-Time Availability Already Exists

**Scenario:** User saves schedule multiple times with same one-time slot.

**Action:**

- Check if one-time availability exists
- Compare by date/time (≤15 min) and duration
- Skip creation if already exists

**Code:** Lines 545-609

---

### Case 13: Slot Should Be Recurring But Recurring Already Exists

**Scenario:** User marks a slot as recurring, but a recurring availability already exists for that day/time.

**Action:**

- Check `existingRecurring` before creating
- Skip creation if found
- Continue to next slot

**Code:** Lines 487-513

---

### Case 14: DTSTART Extraction Methods

**Scenario:** RRULE may have DTSTART in different formats or locations.

**Action:**

- Try `rule.options.dtstart` (parsed RRULE)
- Fallback to regex: `/DTSTART:(\d{8})T(\d{2})(\d{2})/`
- For one-time: also try `oneTime.dtstart` from database

**Code:** Lines 320-337, 428-443, 550-578

---

### Case 15: EXDATE Check in Different Formats

**Scenario:** EXDATE may be in RRuleSet object or in RRULE string.

**Action:**

- If `RRuleSet`: use `rule.exdates()`
- Otherwise: regex `/EXDATE:([^\n]+)/` and parse comma-separated dates

**Code:** Lines 352-361, 405-422, 459-468

---

## Key Constants and Tolerances

- **Time tolerance:** 15 minutes (slots within 15 minutes are considered matching)
- **Duration matching:** Exact match required (no tolerance)
- **Date comparison:** Date-only comparison (time set to 00:00:00) for EXDATE checks

## Helper Functions Used

- `parseTimeToMinutes(time: string)`: Converts "HH:MM" to total minutes
- `calculateDurationMinutes(start, end)`: Calculates duration in minutes
- `getDayOffsetFromToday(date)`: Calculates days from today
- `parseTimeToHour(time: string)`: Extracts hour from time string
- `addExdateForDay()`: Adds EXDATE to RRULE for a specific date
- `rrulestr()`: Parses RRULE string to RRule/RRuleSet object
- `format()` (date-fns): Formats date to string

## Availability Creation

Availabilities are now created using the RRule library directly in the application code:

1. **Recurring availability:**
   - Create Date object with local time using `setHours()`
   - Use RRule library to generate RRULE string with proper UTC conversion
   - Insert directly into database

2. **One-time availability:**
   - Create Date object with local time using `setHours()`
   - Use RRule library to generate RRULE string (DAILY with COUNT=1)
   - Insert directly into database

**Note:** The database RPC functions `create_recurring_availability` and `create_onetime_availability` have been removed due to timezone issues. All availability creation now uses the RRule library in the service layer.

## Important Notes

1. **No duplicate creation:** The code always checks if an availability exists before creating it
2. **EXDATE vs deletion:** Recurring availabilities are excluded (EXDATE) rather than deleted when removed from schedule
3. **Recurring takes precedence:** If a slot matches a recurrence, no one-time availability is created
4. **Tolerance handling:** 15-minute time tolerance allows for slight time differences (e.g., 9:00 vs 9:05)
5. **Error resilience:** Multiple fallback methods for parsing RRULE and extracting DTSTART
6. **Date-only comparisons:** EXDATE checks compare dates only (ignoring time) to avoid timezone issues
