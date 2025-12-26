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

The system consists of several components working together:

```
┌─────────────────┐
│  pg_cron Job    │  (Runs hourly)
│  (Hourly @ :00) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  send_appointment_reminders()│  (Database Function)
│  - Queries accepted missions │
│  - Calls Edge Function       │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  appointment-reminders        │  (Edge Function)
│  Edge Function                │
│  - Expands RRULEs            │
│  - Filters 24h window         │
│  - Sends emails               │
│  - Records reminders          │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │  (Email Service)
│  - Sends emails │
└─────────────────┘
```

## Components

### 1. Database Table: `appointment_reminders`

Tracks which reminders have been sent to prevent duplicates.

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
- Unique constraint prevents duplicate reminders for the same occurrence
- Indexed for efficient queries
- RLS policies allow professionals to view their own reminders

### 2. Database Function: `send_appointment_reminders()`

Called by the cron job to identify missions needing reminders.

**Functionality:**
1. Queries all accepted missions with their schedules
2. Filters missions that haven't ended yet
3. Calls the Edge Function via `pg_net` with mission data
4. Returns count of missions queued

**Schedule:**
- Runs every hour at minute 0 (`'0 * * * *'`)
- Cron job name: `send-appointment-reminders`

### 3. Edge Function: `appointment-reminders`

Processes reminders and sends emails.

**Endpoint:** `POST /functions/v1/appointment-reminders`

**Authentication:** Uses service role key (called by database cron)

**Process Flow:**

1. **Receive Mission Data**
   - Accepts array of missions with their schedules
   - Validates request body using Zod schemas

2. **For Each Mission:**
   - Fetches full mission details (professional, structure, preferences)
   - Checks if professional has `appointment_reminders` enabled
   - Skips if disabled

3. **For Each Schedule:**
   - Expands RRULE to get all occurrences
   - Filters occurrences in 23-25 hour window (24h ± 1h buffer)
   - Checks if reminder already sent (via `appointment_reminders` table)

4. **For Each Occurrence Needing Reminder:**
   - Renders email template with mission details
   - Sends email via Resend
   - Records reminder in database
   - Handles errors gracefully (logs but continues)

**Response:**
```typescript
{
  total_processed: number;
  total_sent: number;
  total_failed: number;
  results: ReminderResult[];
}
```

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

### Hourly Execution

1. **Cron Job Triggers** (every hour at :00)
   ```
   cron.schedule('send-appointment-reminders', '0 * * * *', ...)
   ```

2. **Database Function Executes**
   ```sql
   SELECT public.send_appointment_reminders()
   ```
   - Queries: `SELECT * FROM missions WHERE status = 'accepted' AND mission_until > NOW()`
   - Collects mission data with schedules
   - Calls Edge Function via `pg_net`

3. **Edge Function Processes**
   - Receives mission data
   - Expands RRULEs to get occurrences
   - Filters: `occurrence >= now + 23h AND occurrence <= now + 25h`
   - Checks: `SELECT * FROM appointment_reminders WHERE ...`
   - Sends emails for new reminders
   - Records: `INSERT INTO appointment_reminders ...`

4. **Email Sent**
   - Professional receives email 24 hours before appointment
   - Email includes mission details and appointment time

## RRULE Expansion

The system uses the `rrule` library to expand recurring patterns:

```typescript
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
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
- Filters to 23-25 hour window for reminders

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

2. **Trigger Reminder Check:**
   ```sql
   SELECT public.send_appointment_reminders();
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

The Edge Function response includes `total_failed` and `results` with error details. Check Edge Function logs for detailed error messages.

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

The system is created by migration:
- `supabase/migrations/20251226104946_create_appointment_reminders.sql`

To apply:
```bash
supabase migration up
```

To rollback:
```bash
supabase migration down
```

