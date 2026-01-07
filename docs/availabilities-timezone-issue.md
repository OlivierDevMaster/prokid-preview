# Availability Timezone Issue

## Problem Description

When creating new availabilities in the `/professional/availabilities` edit modal, the displayed time is incorrect. For example:
- **User Input**: 07:00 - 08:00 (7am to 8am local time in Madagascar, GMT+3)
- **Displayed Result**: 10:00 - 11:00 (10am to 11am)

The times are being shifted by 3 hours (the timezone offset for Madagascar).

## Root Cause

The issue stems from a timezone conversion mismatch between how times are saved and how they are displayed.

### Current Flow

1. **User Input (Local Time)**
   - User enters `07:00` in the time input field
   - This is interpreted as local time (Madagascar, GMT+3)
   - The code extracts the hour using `parseTimeToHour("07:00")` which returns `7`

2. **Saving to Database (Treated as UTC)**
   - The hour `7` is passed to database functions:
     - `create_onetime_availability()` for one-time availabilities
     - `create_recurring_availability()` for recurring availabilities
   - These functions create RRULE with DTSTART in UTC format:
     ```sql
     'DTSTART:' || ... || 'T' || LPAD(hour::TEXT, 2, '0') || '0000Z'
     ```
   - The `'Z'` suffix indicates UTC timezone
   - Result: `DTSTART:YYYYMMDDT070000Z` (7am UTC)

3. **Timezone Conversion**
   - Madagascar is GMT+3 (3 hours ahead of UTC)
   - `070000Z` (7am UTC) = `10:00` local time in Madagascar

4. **Displaying (Local Time Conversion)**
   - The code retrieves the availability and parses the ISO string:
     ```typescript
     const startDate = parseISO(slot.startAt);
     const startTime = format(startDate, 'HH:mm');
     ```
   - `parseISO()` correctly parses the UTC time
   - `format()` converts to local timezone for display
   - Result: `070000Z` → displays as `10:00` (local time)

### Visual Flow Diagram

```
User Input: 07:00 (local time in Madagascar, GMT+3)
    ↓
parseTimeToHour("07:00") → 7
    ↓
Database function: create_onetime_availability(hour=7)
    ↓
Creates: DTSTART:YYYYMMDDT070000Z (7am UTC)
    ↓
Stored in DB: 7am UTC = 10am Madagascar time
    ↓
Retrieved: parseISO("...T07:00:00Z")
    ↓
Displayed: format(date, 'HH:mm') → 10:00 (local time)
```

## Technical Details

### Files Involved

1. **Frontend - Time Input**
   - `features/professional/Availabilities/components/AvailabilitiesEditPage.tsx`
   - Lines 105-108: Parsing and formatting times for display
   - Line 556, 660: Extracting hour from time string

2. **Service Layer**
   - `features/professional/Availabilities/availabilities.service.ts`
   - `parseTimeToHour()` function (line 1067): Extracts hour from "HH:mm" format
   - Calls database RPC functions with local hour value

3. **Database Functions**
   - `supabase/migrations/20251203024451_app_utils.sql`
   - `create_onetime_availability()` (line 219): Creates DTSTART with 'Z' suffix
   - `create_recurring_availability()` (line 157): Creates DTSTART with 'Z' suffix
   - Both functions treat the hour parameter as UTC

### Code References

**Extracting hour (local time treated as UTC):**
```typescript
// availabilities.service.ts:1067
function parseTimeToHour(time: string): number {
  const [hours] = time.split(':');
  return parseInt(hours, 10);
}
```

**Database function creating UTC time:**
```sql
-- app_utils.sql:231
dtstart_text := 'DTSTART:' ||
                TO_CHAR(CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
                'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';
--                                                                                    ^^^ UTC suffix
```

**Displaying (converts UTC to local):**
```typescript
// AvailabilitiesEditPage.tsx:105-108
const startDate = parseISO(slot.startAt);  // Parses UTC time
const endDate = parseISO(slot.endAt);
const startTime = format(startDate, 'HH:mm');  // Converts to local time
const endTime = format(endDate, 'HH:mm');
```

## Impact

- **User Experience**: Users see incorrect times displayed, making it confusing to manage availabilities
- **Data Integrity**: The stored times are technically correct (UTC), but they don't match user expectations
- **Geographic Scope**: Affects all users in timezones other than UTC

## Solution Approach

**✅ FIXED**: The issue has been resolved by replacing the database RPC functions with RRule library calls.

### Implementation

1. **Replaced `create_recurring_availability` RPC with RRule library**
   - Create Date object with local time using `setHours()`
   - Use RRule library to generate RRULE string with proper UTC conversion
   - Insert directly into database

2. **Replaced `create_onetime_availability` RPC with RRule library**
   - Create Date object with local time using `setHours()`
   - Use RRule library to generate RRULE string (DAILY with COUNT=1)
   - Insert directly into database

### How It Works

- JavaScript `Date` objects store time internally as UTC
- When you call `setHours(7, 0, 0, 0)` in GMT+3, it stores `4am UTC` internally
- RRule's `.toString()` formats it correctly as `DTSTART:...T040000Z`
- When displayed: `4am UTC` = `7am local time` ✓

### Code Changes

**Before (problematic):**
```typescript
const hour = parseTimeToHour(slot.start); // Returns 7
await supabase.rpc('create_onetime_availability', { hour: 7 }); // Treated as 7am UTC ❌
```

**After (fixed):**
```typescript
const slotDate = new Date(targetDate);
const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
slotDate.setHours(slotHours, slotMinutes, 0, 0); // 7am local = 4am UTC internally

const newRule = new RRule({
  count: 1,
  dtstart: slotDate, // Date object with correct UTC conversion
  freq: RRule.DAILY,
});

await supabase.from('availabilities').insert({
  rrule: newRule.toString(), // Will output correct UTC time
  duration_mn: durationMinutes,
  user_id: userId,
});
```

## Related Files

- `features/professional/Availabilities/components/AvailabilitiesEditPage.tsx`
- `features/professional/Availabilities/availabilities.service.ts`
- `supabase/migrations/20251203024451_app_utils.sql`
- `features/professional/Availabilities/components/AvailabilitySlot.tsx` (display component)

## Notes

- The database correctly stores UTC times (best practice)
- The issue was in the conversion layer between user input and database storage
- The display logic is correct (it properly converts UTC to local time)
- **Fixed**: Now using RRule library which properly handles timezone conversion
- The database RPC functions (`create_onetime_availability` and `create_recurring_availability`) are no longer used
- All availability creation now uses RRule library directly in the service layer

## Status

✅ **RESOLVED** - The timezone issue has been fixed by replacing database RPC functions with RRule library calls.

