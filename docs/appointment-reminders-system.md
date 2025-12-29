# Appointment Reminders System

## Overview

The appointment reminders system automatically sends email reminders to professionals 24 hours before each mission schedule occurrence. This ensures professionals are notified in advance about their upcoming work assignments.

## Key Features

- **Automatic Reminders**: Sends emails 24 hours before each appointment
- **Recurring Mission Support**: Handles recurring missions with multiple occurrences, sending a reminder for each one
- **Preference-Based**: Respects professional notification preferences
- **Duplicate Prevention**: Ensures each occurrence gets only one reminder
- **Multi-language Support**: Supports French and English based on user preference
- **Status Filtering**: Only sends reminders for accepted missions

## Architecture

The system uses a queue-based architecture for better scalability and flexibility. All RRULE expansion and manipulation happens exclusively in Edge Functions, not in the database.

```
┌─────────────────┐
│  pg_cron Job    │  (Runs hourly @ :00)
│  queue-appointment-reminders│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  queue_appointment_reminders()│  (Database Function)
│  - Queries accepted missions │
│  - Calls expand-rrules       │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  expand-rrules               │  (Edge Function)
│  - Expands RRULEs            │
│  - Filters 24h window        │
│  - Populates queue           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  appointment_reminders_pending│  (Queue Table)
│  - Status tracking           │
│  - Retry logic               │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  process-reminders            │  (Edge Function)
│  - Processes queue           │
│  - Sends emails              │
│  - Updates status            │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │  (Email Service)
│  - Sends emails │
└─────────────────┘
```

## Components

### 1. Database Table: `appointment_reminders_pending`

Queue table for reminders waiting to be processed. All RRULE expansion happens in Edge Functions, and results are stored here.

**Schema:**
```sql
CREATE TABLE appointment_reminders_pending (
  id UUID PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  mission_schedule_id UUID REFERENCES mission_schedules(id) ON DELETE CASCADE,
  occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  reminder_type TEXT DEFAULT 'email', -- email, sms, push (for future)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (mission_schedule_id, occurrence_date, reminder_type)
);
```

**Key Features:**
- Status tracking for queue processing
- Retry logic with exponential backoff
- Support for multiple reminder types (email, SMS, push)
- Unique constraint prevents duplicates per reminder type
- CASCADE delete when mission ends
- Indexed for efficient queue queries

### 2. Database Table: `appointment_reminders`

Tracks which reminders have been successfully sent (history table).

**Schema:**
```sql
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY,
  mission_id UUID REFERENCES missions(id),
  mission_schedule_id UUID REFERENCES mission_schedules(id),
  occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (mission_schedule_id, occurrence_date)
);
```

**Key Features:**
- Historical record of sent reminders
- Unique constraint prevents duplicate reminders
- Indexed for efficient queries
- RLS policies allow professionals to view their own reminders

### 3. Database Function: `queue_appointment_reminders()`

Queues missions for RRULE expansion (which happens in Edge Function).

**Functionality:**
1. Queries all accepted missions with their schedules
2. Filters missions that haven't ended yet
3. Calls `expand-rrules` Edge Function via `pg_net` with mission data
4. Edge Function expands RRULEs and populates `appointment_reminders_pending`
5. Returns count of missions queued

**Schedule:**
- Runs every hour at minute 0 (`'0 * * * *'`)
- Cron job name: `queue-appointment-reminders`

### 4. Database Function: `cleanup_ended_mission_reminders()`

Cleans up pending reminders for ended/cancelled/declined/expired missions.

**Functionality:**
1. Deletes pending and processing reminders for ended missions
2. Keeps sent reminders for history
3. Returns count of reminders cleaned up

**Schedule:**
- Runs every hour at minute 5 (`'5 * * * *'`)
- Cron job name: `cleanup-ended-mission-reminders`

### 5. Database Function: `process_appointment_reminders()`

Calls the process-reminders Edge Function to process the queue.

**Functionality:**
1. Calls `process-reminders` Edge Function via `pg_net`
2. Edge Function processes the queue and sends reminders
3. Returns success/failure status

**Schedule:**
- Runs every 10 minutes (`'*/10 * * * *'`)
- Cron job name: `process-appointment-reminders`

### 6. Edge Function: `expand-rrules`

Expands RRULEs and populates the pending queue.

**Endpoint:** `POST /functions/v1/expand-rrules`

**Authentication:** Uses service role key (called by database cron)

**Process Flow:**

1. **Receive Mission Data**
   - Accepts array of missions with their schedules
   - Validates request body using Zod schemas

2. **For Each Mission:**
   - For each schedule:
     - Expands RRULE using `rrule` library
     - Filters occurrences in 23-25 hour window (24h ± 1h)
     - Checks if already in queue or already sent
     - Inserts into `appointment_reminders_pending` with status='pending'

3. **Returns:**
   - Count of reminders queued
   - Any errors encountered

**Key Points:**
- All RRULE manipulation happens here (not in database)
- Only expands occurrences in the reminder window
- Prevents duplicates by checking existing queue and sent reminders

### 7. Edge Function: `process-reminders`

Processes the queue and sends reminders.

**Endpoint:** `POST /functions/v1/process-reminders`

**Authentication:** Uses service role key (called by database cron)

**Process Flow:**

1. **Select Pending Reminders**
   - Uses `SELECT FOR UPDATE SKIP LOCKED` for concurrent processing
   - Selects up to batch_size (default: 50) pending reminders
   - Filters by status='pending' and next_retry_at

2. **For Each Reminder:**
   - Update status to 'processing'
   - Fetch mission details (professional, structure, preferences)
   - Check notification preferences (skip if disabled)
   - Send reminder based on `reminder_type` (email/SMS/push)
   - Update status to 'sent' or 'failed'
   - If failed, set `next_retry_at` with exponential backoff
   - Record in `appointment_reminders` (history) if sent

3. **Returns:**
   - Count of reminders processed, sent, and failed

**Key Features:**
- `SKIP LOCKED` allows concurrent processing
- Exponential backoff for retries (1h, 2h, 4h, 8h, max 24h)
- Supports multiple reminder types
- Graceful error handling

### 4. Email Template

Located at: `supabase/functions/_shared/templates/emails/appointment-reminder/body.ts`

**Template Variables:**
- `title`: Email title (localized)
- `mission_title`: Mission title
- `mission_description`: Mission description (optional)
- `structure_name`: Structure name
- `appointment_date_time`: Formatted date and time
- `appointment_duration`: Formatted duration (e.g., "2h30min")
- `professional_name`: Professional's full name
- `professional_email`: Professional's email
- `footer_text`: Footer text with timestamp

**Localization:**
- Supports French and English
- Uses professional's `preferred_language` from profile
- Date/time formatting uses appropriate locale

## Data Flow

### Queue Population (Hourly)

1. **Cron Job Triggers** (every hour at :00)
   ```
   cron.schedule('queue-appointment-reminders', '0 * * * *', ...)
   ```

2. **Database Function Executes**
   ```sql
   SELECT public.queue_appointment_reminders()
   ```
   - Queries: `SELECT * FROM missions WHERE status = 'accepted' AND mission_until > NOW()`
   - Collects mission data with schedules
   - Calls `expand-rrules` Edge Function via `pg_net`

3. **Edge Function Expands RRULEs**
   - Receives mission data
   - Expands RRULEs to get occurrences (using `rrule` library)
   - Filters: `occurrence >= now + 23h AND occurrence <= now + 25h`
   - Checks: `SELECT * FROM appointment_reminders_pending WHERE ...` (already queued)
   - Checks: `SELECT * FROM appointment_reminders WHERE ...` (already sent)
   - Inserts: `INSERT INTO appointment_reminders_pending ...` (status='pending')

### Queue Processing (Every 10 Minutes)

1. **Cron Job Triggers** (every 10 minutes)
   ```
   cron.schedule('process-appointment-reminders', '*/10 * * * *', ...)
   ```

2. **Database Function Executes**
   ```sql
   SELECT public.process_appointment_reminders()
   ```
   - Calls `process-reminders` Edge Function via `pg_net`

3. **Edge Function Processes Queue**
   - Selects pending reminders using `SELECT FOR UPDATE SKIP LOCKED`
   - For each reminder:
     - Updates status to 'processing'
     - Fetches mission details
     - Checks notification preferences
     - Sends email via Resend
     - Updates status to 'sent' or 'failed'
     - Records in `appointment_reminders` (history) if sent

4. **Email Sent**
   - Professional receives email 24 hours before appointment
   - Email includes mission details and appointment time

### Cleanup (Hourly)

1. **Cron Job Triggers** (every hour at :05)
   ```
   cron.schedule('cleanup-ended-mission-reminders', '5 * * * *', ...)
   ```

2. **Database Function Executes**
   ```sql
   SELECT public.cleanup_ended_mission_reminders()
   ```
   - Deletes pending/processing reminders for ended/cancelled/declined/expired missions
   - Keeps sent reminders for history

## RRULE Expansion

**Important:** All RRULE expansion and manipulation happens exclusively in Edge Functions, not in the database. This ensures we have access to the full `rrule` library capabilities.

The system uses the `rrule` library in the `expand-rrules` Edge Function:

```typescript
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date,
  reminderWindowStart: Date,
  reminderWindowEnd: Date
): Date[]
```

**Handles:**
- Simple RRULE patterns
- RRuleSet (with EXDATE exceptions)
- UNTIL constraints
- COUNT constraints
- Complex BYDAY, BYMONTH, etc. patterns

**Filtering:**
- Only includes occurrences within mission date range
- Filters to 23-25 hour window for reminders (24h ± 1h)
- Results are stored in `appointment_reminders_pending` queue

## Notification Preferences

The system respects the `appointment_reminders` setting in `professional_notification_preferences`:

```sql
SELECT appointment_reminders
FROM professional_notification_preferences
WHERE user_id = professional_id
```

- If `appointment_reminders = false`: Skip sending reminder
- If `appointment_reminders = true`: Send reminder (default)

## Time Window Logic

Reminders are sent when an occurrence falls within a 1-hour window:

- **Window Start**: Current time + 23 hours
- **Window End**: Current time + 25 hours
- **Target**: 24 hours before appointment

This 1-hour buffer accounts for:
- Hourly cron execution (may run up to 59 minutes late)
- Processing time
- Email delivery delays

## Error Handling

The system is designed to be resilient:

1. **Database Function Errors:**
   - Logs warnings but doesn't fail
   - Returns 0 if no missions found
   - Continues even if Edge Function call fails

2. **Edge Function Errors:**
   - Individual reminder failures don't block others
   - Errors are logged with details
   - Failed reminders are tracked in response
   - Database insert failures are logged but don't prevent email sending

3. **Email Sending Errors:**
   - Resend API errors are caught and logged
   - Failed reminders are recorded in results
   - System continues processing other reminders

## Configuration

### Environment Variables

Required in Edge Function:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `RESEND_API_KEY`: Resend API key for sending emails
- `NOREPLY_EMAIL`: From email address (e.g., `noreply@prokid.com`)

### Database Vault Secrets

Required for database function:
- `supabase_url`: Supabase project URL
- `supabase_service_role_key`: Service role key

### Cron Job Configuration

The cron job is automatically created by the migration:

```sql
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 * * * *',
  $$SELECT public.send_appointment_reminders()$$
);
```

To manually manage:
```sql
-- Unschedule
SELECT cron.unschedule('send-appointment-reminders');

-- Reschedule
SELECT cron.schedule('send-appointment-reminders', '0 * * * *', $$SELECT public.send_appointment_reminders()$$);
```

## Testing

### Manual Testing

1. **Create Test Mission:**
   ```sql
   -- Create an accepted mission with a schedule
   INSERT INTO missions (..., status = 'accepted', mission_dtstart = NOW() + INTERVAL '25 hours', ...);
   ```

2. **Trigger Queue Population:**
   ```sql
   SELECT public.queue_appointment_reminders();
   ```

3. **Check Queue:**
   ```sql
   SELECT * FROM appointment_reminders_pending WHERE status = 'pending';
   ```

4. **Trigger Processing:**
   ```sql
   SELECT public.process_appointment_reminders();
   ```

3. **Verify:**
   ```sql
   -- Check if reminder was sent
   SELECT * FROM appointment_reminders WHERE mission_id = '...';

   -- Check email was sent (via Resend dashboard or logs)
   ```

### Testing Recurring Missions

1. Create a mission with recurring schedule (e.g., daily for 7 days)
2. Wait for cron job to run
3. Verify reminders are sent for each occurrence
4. Verify no duplicate reminders (check unique constraint)

### Testing Notification Preferences

1. Disable reminders for a professional:
   ```sql
   UPDATE professional_notification_preferences
   SET appointment_reminders = false
   WHERE user_id = '...';
   ```

2. Trigger reminder check
3. Verify no email sent
4. Re-enable and verify email is sent

## Monitoring

### Check Cron Job Status

```sql
SELECT * FROM cron.job WHERE jobname = 'send-appointment-reminders';
```

### View Recent Reminders

```sql
SELECT
  ar.*,
  m.title as mission_title,
  p.email as professional_email
FROM appointment_reminders ar
JOIN missions m ON m.id = ar.mission_id
JOIN professionals pr ON pr.user_id = m.professional_id
JOIN profiles p ON p.user_id = pr.user_id
ORDER BY ar.sent_at DESC
LIMIT 50;
```

### Check Failed Reminders

```sql
-- Failed reminders with error messages
SELECT
  arp.*,
  m.title as mission_title
FROM appointment_reminders_pending arp
JOIN missions m ON m.id = arp.mission_id
WHERE arp.status = 'failed'
ORDER BY arp.last_attempt_at DESC
LIMIT 50;
```

### Check Reminders Needing Retry

```sql
-- Reminders ready for retry
SELECT
  arp.*,
  m.title as mission_title
FROM appointment_reminders_pending arp
JOIN missions m ON m.id = arp.mission_id
WHERE arp.status = 'pending'
  AND arp.next_retry_at <= NOW()
ORDER BY arp.next_retry_at
LIMIT 50;
```

## Troubleshooting

### Reminders Not Sending

1. **Check Cron Job:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-appointment-reminders';
   ```

2. **Check Database Function:**
   ```sql
   SELECT public.send_appointment_reminders();
   -- Should return number > 0 if missions found
   ```

3. **Check Edge Function Logs:**
   - Verify Edge Function is receiving requests
   - Check for errors in processing

4. **Check Notification Preferences:**
   ```sql
   SELECT * FROM professional_notification_preferences
   WHERE appointment_reminders = false;
   ```

5. **Check Environment Variables:**
   - Verify `RESEND_API_KEY` is set
   - Verify `NOREPLY_EMAIL` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Duplicate Reminders

The unique constraint on `(mission_schedule_id, occurrence_date)` prevents duplicates. If duplicates occur:

1. Check for constraint violations in logs
2. Verify the constraint exists:
   ```sql
   SELECT * FROM pg_constraint
   WHERE conname = 'appointment_reminders_unique_occurrence';
   ```

### Time Zone Issues

- All timestamps are stored as `TIMESTAMP WITH TIME ZONE`
- RRULE expansion uses UTC internally
- Email formatting uses professional's locale for display
- Reminder window calculation uses server timezone

## Future Enhancements

Potential improvements:

1. **Configurable Reminder Time**: Allow professionals to set custom reminder times (e.g., 12h, 48h)
2. **SMS Reminders**: Add SMS option in addition to email
3. **Calendar Integration**: Add calendar event attachments
4. **Reminder History**: UI to view past reminders
5. **Batch Optimization**: Process reminders in batches for better performance
6. **Retry Logic**: Retry failed email sends with exponential backoff

## Related Documentation

- [Missions and Availability System](./missions-availability-system.md)
- [Database Functions](./database-functions.md)
- [Edge Functions](./edge-functions.md)
- [Email Templates](./email-templates.md)

## Migration

The system is created by migrations:
- `supabase/migrations/20251226104946_create_appointment_reminders.sql` - Initial system
- `supabase/migrations/20251226115129_refactor_appointment_reminders_queue.sql` - Queue-based refactor

To apply:
```bash
supabase migration up
```

To rollback:
```bash
supabase migration down
```

## Queue-Based Architecture Benefits

1. **Scalability**: Edge Function processes reminders one at a time, avoiding payload limits even with millions of occurrences
2. **Flexibility**: Easy to add SMS, push notifications by adding handlers without changing database functions
3. **Reliability**: Failed reminders can be retried automatically with exponential backoff (1h, 2h, 4h, 8h, max 24h)
4. **Observability**: Queue status visible in database with detailed status tracking
5. **Cleanup**: Automatic cleanup of stale reminders for ended/cancelled missions
6. **Separation of Concerns**: RRULE expansion separate from reminder sending, all RRULE manipulation in Edge Functions
7. **Concurrency**: Multiple Edge Function instances can process queue safely using `SELECT FOR UPDATE SKIP LOCKED`
8. **Performance**: Only expands occurrences in the reminder window (23-25h), not all future occurrences

## Queue-Based Architecture Benefits

1. **Scalability**: Edge Function processes reminders one at a time, avoiding payload limits
2. **Flexibility**: Easy to add SMS, push notifications by adding handlers
3. **Reliability**: Failed reminders can be retried automatically with exponential backoff
4. **Observability**: Queue status visible in database
5. **Cleanup**: Automatic cleanup of stale reminders for ended missions
6. **Separation of Concerns**: RRULE expansion separate from reminder sending
7. **Concurrency**: Multiple Edge Function instances can process queue safely using `SELECT FOR UPDATE SKIP LOCKED`

