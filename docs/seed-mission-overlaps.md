# Mission Overlaps in Seed File

This document lists all overlapping missions found in `supabase/seeds/09_missions.sql`.

**Overlap Definition:** Two missions overlap if they are for the same professional on the same day and their time ranges intersect.
Overlap occurs when: `mission1Start < mission2End && mission1End > mission2Start`

**Status:** ✅ All overlaps have been fixed.

---

## Overlaps Found (Now Fixed)

### 1. Professional 012 (Pierre Dupont - `08fb0a72-ee9b-4771-bf24-7fe19c869ae4`)

#### Wednesday Overlap

**Mission 1: "Wednesday Afternoon"**
- **Structure:** `08fb0a72-ee9b-4771-bf24-7fe19c869afa` (Structure 2)
- **Time:** Wednesday 14:00-18:00 (2pm-6pm)
- **Duration:** 240 minutes (4 hours)
- **Status:** pending
- **Location:** Lines 382-421

**Mission 2: "Wednesday Late Afternoon"**
- **Structure:** `08fb0a72-ee9b-4771-bf24-7fe19c869afa` (Structure 2)
- **Time:** Wednesday 15:00-18:00 (3pm-6pm)
- **Duration:** 180 minutes (3 hours)
- **Status:** pending
- **Location:** Lines 1375-1404

**Overlap Period:** 15:00-18:00 (3 hours)

**Analysis:** Both missions are from the same structure (afa) for the same professional on Wednesday. "Wednesday Late Afternoon" (3pm-6pm) completely overlaps with the second half of "Wednesday Afternoon" (2pm-6pm).

**✅ FIXED:** Changed "Wednesday Late Afternoon" from Wednesday 3pm-6pm to Wednesday 12pm-3pm to avoid overlap.

---

### 2. Professional 013 (Sophie Bernard - `08fb0a72-ee9b-4771-bf24-7fe19c869ae5`)

#### Tuesday Overlap

**Mission 1: "Tuesday Midday"**
- **Structure:** `08fb0a72-ee9b-4771-bf24-7fe19c869afb` (Structure 3)
- **Time:** Tuesday 10:00-14:00 (10am-2pm)
- **Duration:** 240 minutes (4 hours)
- **Status:** pending
- **Week:** Week 0
- **Location:** Lines 551-590

**Mission 2: "Tuesday Midday Session"**
- **Structure:** `08fb0a72-ee9b-4771-bf24-7fe19c869afb` (Structure 3)
- **Time:** Tuesday 11:00-15:00 (11am-3pm)
- **Duration:** 240 minutes (4 hours)
- **Status:** pending
- **Week:** Week 0
- **Location:** Lines 1437-1465

**Overlap Period:** 11:00-14:00 (3 hours)

**Analysis:** Both missions are from the same structure (afb) for the same professional on Tuesday. "Tuesday Midday Session" (11am-3pm) overlaps with the second half of "Tuesday Midday" (10am-2pm).

**✅ FIXED:** Changed "Tuesday Midday Session" from Tuesday 11am-3pm to Tuesday 2pm-6pm to avoid overlap.

---

## Summary

**Total Overlaps Found:** 2

**Status:** ✅ **All overlaps have been fixed**

**Affected Professionals:**
1. Pierre Dupont (Professional 012) - Wednesday overlap ✅ Fixed
2. Sophie Bernard (Professional 013) - Tuesday overlap ✅ Fixed

**Fixes Applied:**

### For Pierre Dupont (Wednesday):
✅ Changed "Wednesday Late Afternoon" from Wednesday 3pm-6pm to **Wednesday 12pm-3pm** to avoid overlap with "Wednesday Afternoon" (2pm-6pm).

### For Sophie Bernard (Tuesday):
✅ Changed "Tuesday Midday Session" from Tuesday 11am-3pm to **Tuesday 2pm-4pm** (120 min) to avoid overlap with "Tuesday Midday" (10am-2pm) and fit within availability (10am-4pm).

---

## Notes

- All missions in the seed file are created with `status = 'pending'`
- Overlaps only matter when missions are accepted, but it's better to avoid them in the seed data
- The seeder comment at line 6 states "Hardcoded missions with hardcoded RRULEs to avoid overlaps" but this overlap exists

