# Mission Creation and Edition - Potential Issues

This document lists all potential issues, edge cases, and areas of concern related to mission creation and edition functionality.

## Table of Contents

1. [Recurrence Validation Issues](#recurrence-validation-issues)
2. [Schedule Management Issues](#schedule-management-issues)
3. [Date and Time Validation](#date-and-time-validation)
4. [Data Consistency Issues](#data-consistency-issues)
5. [User Experience Issues](#user-experience-issues)
6. [Backend/Frontend Synchronization](#backendfrontend-synchronization)
7. [Performance Concerns](#performance-concerns)
8. [Error Handling](#error-handling)

---

## Recurrence Validation Issues

### 1. **isAvailabilityRecurrent Check for Existing Schedules**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 145-180)

**Issue:** When converting existing schedules to form format, `isAvailabilityRecurrent` is determined from the schedule's rrule pattern, not from the original availability's recurrence status.

**Impact:**

- Users can enable recurrence for schedules that weren't originally created from recurring availabilities
- The checkbox state may not accurately reflect the original availability's recurrence capability

**Current Behavior:**

```typescript
const isRecurrent =
  schedule.rrule.includes('FREQ=WEEKLY') ||
  schedule.rrule.includes('FREQ=DAILY') ||
  schedule.rrule.includes('FREQ=MONTHLY');
// ...
isAvailabilityRecurrent: isRecurrent,  // Uses schedule rrule, not original availability
```

**Recommendation:**

- Store the original availability's recurrence status when creating schedules
- Or add backend validation to prevent enabling recurrence for non-recurring availabilities

### 2. **Missing Backend Validation for Recurrence**

**Issue:** No backend validation ensures that a schedule marked as recurrent was originally created from a recurring availability.

**Impact:**

- Data inconsistency between frontend UI restrictions and backend acceptance
- Potential for invalid schedule configurations

**Recommendation:**

- Add backend validation in the mission update handler
- Validate that `isRecurrent: true` is only allowed when the original availability was recurrent

---

## Schedule Management Issues

### 3. **Schedule ID Tracking in Edit Mode**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 290-350)

**Issue:** The `scheduleId` field is stored as an optional property in the form data, which requires type assertions and may lead to runtime errors.

**Impact:**

- Type safety concerns
- Potential for losing track of which schedules need updates vs creation

**Current Implementation:**

```typescript
const scheduleWithId = s as {
  scheduleId?: string;
} & MissionScheduleFormData;
```

**Recommendation:**

- Add `scheduleId` as an optional field in the Zod schema
- Improve type safety with proper TypeScript types

### 4. **Schedule Deletion Logic**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 290-303)

**Issue:** Schedules are deleted if they exist in the database but not in the form. This could accidentally delete schedules if:

- User removes a schedule and then navigates away without saving
- Form state is lost due to page refresh
- User accidentally removes a schedule

**Impact:**

- Data loss risk
- No confirmation dialog before deletion

**Recommendation:**

- Add confirmation dialog before deleting schedules
- Implement optimistic updates with rollback capability
- Add undo functionality

### 5. **Schedule Overlap Validation**

**Issue:** No validation prevents creating overlapping schedules within the same mission.

**Impact:**

- Users can create conflicting schedules
- Potential for double-booking scenarios

**Recommendation:**

- Add frontend validation to check for overlapping schedules
- Add backend validation as a safety net
- Display warnings when overlaps are detected

### 6. **Minimum Schedule Requirement**

**Location:** `features/structure/missions/schemas/mission.schema.ts` (line 75)

**Issue:** The schema requires at least one schedule, but there's no validation preventing users from removing all schedules in edit mode.

**Impact:**

- Form submission could fail if all schedules are removed
- Poor user experience with unclear error messages

**Recommendation:**

- Add UI validation to prevent removing the last schedule
- Show clear error message if user tries to submit with no schedules
- Consider allowing zero schedules for draft missions

---

## Date and Time Validation

### 7. **Mission Date Range Changes**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 199-280)

**Issue:** When mission start/end dates are changed, existing schedules may fall outside the new date range.

**Impact:**

- Schedules created for the old date range may become invalid
- No automatic adjustment or warning when dates change

**Recommendation:**

- Validate that all schedules fall within the new mission date range
- Auto-adjust schedule dates or show warnings for out-of-range schedules
- Prevent date changes that would invalidate existing schedules (or require schedule updates first)

### 8. **Schedule Time Validation Against Availability**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 1000-1146)

**Issue:** Users can edit schedule start/end times to values outside the original availability slot range.

**Impact:**

- Schedules may not align with professional availabilities
- Potential for booking conflicts

**Current Behavior:**

- Min/max constraints are set based on availability range
- But these constraints may not be enforced if availability data is missing for existing schedules

**Recommendation:**

- Ensure availability constraints are always available
- Add validation to prevent time changes that exceed availability bounds
- Show clear error messages when constraints are violated

### 9. **Past Date Validation in Edit Mode**

**Location:** `features/structure/missions/schemas/mission.schema.ts` (lines 83-106)

**Issue:** Edit schema allows past dates (no date validation), but CreateMissionForm has validation preventing past dates.

**Impact:**

- Inconsistent behavior between create and edit modes
- Users can set mission dates in the past during editing

**Recommendation:**

- Decide on consistent behavior: allow or disallow past dates in both modes
- If allowing past dates, ensure schedules are not created for past dates
- Add clear UI indicators for past dates

---

## Data Consistency Issues

### 10. **RRULE Generation for Non-Matching Availabilities**

**Location:** `features/structure/missions/components/CreateMissionForm.tsx` (lines 317-322)

**Issue:** When no matching availability is found, a simple weekly rrule is generated based on the day of week, which may not match the professional's actual availability pattern.

**Impact:**

- Generated schedules may not align with professional's real availability
- Potential for booking conflicts

**Current Behavior:**

```typescript
if (!rrule) {
  const dayOfWeek = start.getDay();
  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  rrule = `FREQ=WEEKLY;BYDAY=${dayNames[dayOfWeek]}`;
}
```

**Recommendation:**

- Warn users when creating schedules without matching availabilities
- Require explicit confirmation for custom schedules
- Consider preventing schedule creation without matching availability

### 11. **Schedule Duration Calculation**

**Location:** Multiple locations in both CreateMissionForm and EditMissionPage

**Issue:** Duration is calculated from start/end times, but there's no validation that the duration matches the original availability slot duration.

**Impact:**

- Duration may not match professional's availability
- Potential for scheduling conflicts

**Recommendation:**

- Validate duration against availability slot duration
- Show warnings when duration differs significantly
- Allow flexibility but with clear indicators

### 12. **Mission Status Transitions**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 80-111)

**Issue:** Status transitions may not be properly validated. For example:

- Can a mission be changed from "accepted" to "draft"?
- What happens to schedules when status changes?

**Impact:**

- Invalid status transitions
- Data inconsistency

**Recommendation:**

- Define clear status transition rules
- Add validation for status changes
- Handle schedule state based on status transitions

---

## User Experience Issues

### 13. **No Save Confirmation**

**Issue:** No confirmation dialog when navigating away from edit page with unsaved changes.

**Impact:**

- Accidental data loss
- Poor user experience

**Recommendation:**

- Implement unsaved changes detection
- Show confirmation dialog before navigation
- Auto-save draft changes

### 14. **Step Navigation Without Validation**

**Location:** `features/structure/missions/components/EditMissionPage.tsx`

**Issue:** Users can navigate between steps without completing required fields in step 1.

**Impact:**

- Incomplete data submission
- Confusing user experience

**Recommendation:**

- Validate step 1 before allowing navigation to step 2
- Show clear error messages for incomplete fields
- Disable "Next" button until step 1 is valid

### 15. **Loading States**

**Issue:** Limited loading state indicators when fetching schedules or updating missions.

**Impact:**

- Users may not know when operations are in progress
- Potential for duplicate submissions

**Recommendation:**

- Add loading spinners for async operations
- Disable form submission during loading
- Show progress indicators for multi-step operations

### 16. **Error Messages**

**Issue:** Error messages may not be user-friendly or specific enough.

**Impact:**

- Users don't understand what went wrong
- Difficult to fix issues

**Recommendation:**

- Provide specific, actionable error messages
- Show field-level errors clearly
- Add help text for complex fields

---

## Backend/Frontend Synchronization

### 17. **TypeScript Type Generation**

**Issue:** Database schema changes require manual type regeneration. The `draft` status was added to the enum, but types may not be up-to-date.

**Impact:**

- Type errors in development
- Runtime errors if types don't match database

**Recommendation:**

- Document the process for regenerating types after schema changes
- Add automated type generation in CI/CD
- Use type assertions only as temporary workarounds

### 18. **Query Cache Invalidation**

**Location:** `features/missions/hooks/useUpdateMissionSchedules.ts` (lines 53-61)

**Issue:** Multiple query keys are invalidated, but some may be missed if query key structure changes.

**Impact:**

- Stale data in UI
- Inconsistent state

**Recommendation:**

- Use query key factories for consistency
- Document all query keys that need invalidation
- Add tests for cache invalidation

### 19. **Optimistic Updates**

**Issue:** No optimistic updates implemented, so UI doesn't reflect changes until server responds.

**Impact:**

- Perceived slowness
- Poor user experience

**Recommendation:**

- Implement optimistic updates for better UX
- Add rollback mechanism for failed updates
- Show loading states during updates

---

## Performance Concerns

### 20. **Availability Slot Fetching**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 200-210)

**Issue:** Availability slots are fetched for the entire week, which may be inefficient for large datasets.

**Impact:**

- Slow page load
- High memory usage

**Recommendation:**

- Implement pagination or lazy loading
- Cache availability data
- Optimize queries

### 21. **Schedule Conversion on Every Render**

**Location:** `features/structure/missions/components/EditMissionPage.tsx` (lines 145-180)

**Issue:** Schedule conversion happens in useEffect, but may run unnecessarily.

**Impact:**

- Unnecessary computations
- Potential performance issues

**Recommendation:**

- Memoize conversion logic
- Only convert when schedules actually change
- Use useMemo for expensive operations

---

## Error Handling

### 22. **Network Error Handling**

**Issue:** Network errors may not be handled gracefully, leading to poor user experience.

**Impact:**

- Users don't know when operations fail
- No retry mechanism

**Recommendation:**

- Add comprehensive error handling
- Show user-friendly error messages
- Implement retry logic for failed requests
- Add offline detection

### 23. **Validation Error Display**

**Issue:** Validation errors may not be displayed clearly or at the right time.

**Impact:**

- Users don't know what to fix
- Frustrating user experience

**Recommendation:**

- Show validation errors immediately
- Highlight invalid fields
- Provide clear error messages
- Show errors at both field and form level

### 24. **Concurrent Edit Prevention**

**Issue:** No mechanism to prevent multiple users from editing the same mission simultaneously.

**Impact:**

- Data conflicts
- Lost updates

**Recommendation:**

- Implement optimistic locking
- Show warning when mission is being edited by another user
- Add last-modified timestamp checks

---

## Additional Considerations

### 25. **Accessibility**

**Issue:** Form may not be fully accessible for screen readers and keyboard navigation.

**Recommendation:**

- Add proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Add focus management

### 26. **Internationalization**

**Issue:** Some hardcoded strings may not be translated.

**Recommendation:**

- Ensure all user-facing strings use translation keys
- Add fallback translations
- Test with different locales

### 27. **Mobile Responsiveness**

**Issue:** Complex forms may not work well on mobile devices.

**Recommendation:**

- Test on mobile devices
- Optimize layout for small screens
- Consider mobile-specific UI patterns
- Ensure touch targets are adequate

---

## Priority Recommendations

### High Priority

1. Fix `isAvailabilityRecurrent` check for existing schedules (#1)
2. Add schedule overlap validation (#5)
3. Add confirmation for schedule deletion (#4)
4. Validate mission date range changes (#7)
5. Add backend validation for recurrence (#2)

### Medium Priority

6. Improve error handling and user feedback (#22, #23)
7. Add optimistic updates (#19)
8. Implement unsaved changes detection (#13)
9. Add schedule minimum validation (#6)
10. Improve loading states (#15)

### Low Priority

11. Performance optimizations (#20, #21)
12. Accessibility improvements (#25)
13. Mobile responsiveness (#26)
14. Concurrent edit prevention (#24)

---

## Testing Recommendations

1. **Unit Tests:**
   - Schedule conversion logic
   - Date validation
   - RRULE generation
   - Status transition logic

2. **Integration Tests:**
   - Mission creation flow
   - Mission editing flow
   - Schedule CRUD operations
   - Error scenarios

3. **E2E Tests:**
   - Complete mission creation workflow
   - Mission editing with schedule changes
   - Error recovery scenarios
   - Multi-step form navigation

4. **Manual Testing:**
   - Edge cases (past dates, overlapping schedules, etc.)
   - Different user roles
   - Various mission statuses
   - Network failure scenarios

---

## Related Documentation

- [Missions and Availability System](./missions-availability-system.md)
- [RRULE Refactoring Plan](./rrule-refactoring-plan.md)
- Database Schema: `supabase/migrations/20251209025545_create_missions.sql`

---

**Last Updated:** 2025-01-08
**Maintained By:** Development Team
