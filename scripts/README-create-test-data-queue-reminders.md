# Create Test Data for queue_appointment_reminders

This script creates test data and tests the `queue_appointment_reminders` function.

## Prerequisites

- Deno installed
- Supabase local instance running
- Environment variables set:
  - `SUPABASE_URL` (default: `http://127.0.0.1:54321`)
  - `SUPABASE_SERVICE_ROLE_KEY`

## Usage

```bash
deno run --allow-net --allow-env --allow-read scripts/create-test-data-queue-reminders.ts
```

Or if you have a `.env` file:

```bash
deno run --allow-net --allow-env --allow-read --env scripts/create-test-data-queue-reminders.ts
```

## What It Does

1. **Creates Test Users:**
   - Structure user (with structure record)
   - Professional user (with professional record)
   - Structure membership (links them)

2. **Creates Test Mission:**
   - Mission with status 'accepted'
   - Mission dates: 20-30 hours from now
   - 3 schedules:
     - Schedule 1: Single occurrence at exactly 24h (should be queued)
     - Schedule 2: Daily occurrences (will have occurrence in window)
     - Schedule 3: Weekly on Monday (might have occurrence in window)

3. **Tests Function:**
   - Calls `queue_appointment_reminders()`
   - Verifies reminders were queued in `appointment_reminders_pending`

4. **Reports Results:**
   - Shows how many missions were processed
   - Lists all queued reminders
   - Provides mission ID for further inspection

## Output

The script will:
- Print progress messages as it creates data
- Show the mission ID and schedule IDs
- Display queued reminders
- Keep test data for manual inspection (doesn't auto-cleanup)

## Cleanup

Test data is kept by default. To clean up manually:

```sql
-- Replace MISSION_ID with the mission ID from script output
DELETE FROM appointment_reminders_pending WHERE mission_id = 'MISSION_ID';
DELETE FROM appointment_reminders WHERE mission_id = 'MISSION_ID';
DELETE FROM mission_schedules WHERE mission_id = 'MISSION_ID';
DELETE FROM missions WHERE id = 'MISSION_ID';
-- Then delete structure_members, structures, professionals, profiles, and auth users
```

## Troubleshooting

**Error: Missing environment variables**
- Make sure `.env` file exists with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Or set them as environment variables

**Error: Failed to create user**
- Check if Supabase is running
- Verify service role key is correct

**No reminders queued**
- Check if occurrences fall in the 23-25 hour window
- Verify Edge Function is running and accessible
- Check Edge Function logs for errors

## Example Output

```
🚀 Starting test data creation for queue_appointment_reminders

📝 Creating structure user: test-structure-queue-1234567890@example.com
✅ Created structure: abc-123-def-456
📝 Creating professional user: test-professional-queue-1234567890@example.com
✅ Created professional: xyz-789-uvw-012
📝 Creating structure membership...
✅ Created membership
📝 Creating test mission...
✅ Created mission: mission-123-456
✅ Created schedule 1: schedule-1-abc (single occurrence at 24h)
✅ Created schedule 2: schedule-2-def (daily)
✅ Created schedule 3: schedule-3-ghi (weekly Monday)

✅ Test data created successfully!
   Mission ID: mission-123-456
   Schedules: 3

🧪 Testing queue_appointment_reminders()...
✅ Function executed successfully
   Missions processed: 1

🔍 Verifying reminders were queued...
   Waiting 3 seconds for Edge Function to process...

📊 Results:
   Total reminders queued: 2

   Reminders:
   1. Schedule: schedule-1-abc
      Occurrence: 2025-12-30T04:00:00.000Z
      Status: pending
      Type: email
   2. Schedule: schedule-2-def
      Occurrence: 2025-12-30T09:00:00.000Z
      Status: pending
      Type: email

✅ Test completed successfully!
```

