# Professional Subscription Features Matrix

This document defines what features professionals can and cannot access based on their subscription status. This will guide the implementation of subscription-based access control throughout the application.

## Subscription Status Definitions

A professional is considered **subscribed** when:
- They have an active subscription with status `active` or `trialing`
- The subscription is not scheduled to cancel (`cancel_at_period_end = false` OR `current_period_end > NOW()`)

The function `is_professional_subscribed(user_id)` returns `true` for subscribed professionals.

## Feature Access Matrix

### ✅ Allowed for Subscribed Professionals

#### Profile Management
- ✅ View their own professional profile
- ✅ Edit their own professional profile (city, postal code, description, hourly rate, skills, etc.)
- ✅ Upload/update profile photo
- ✅ Update contact information (phone, etc.)
- ✅ Update availability status (`is_available` flag)

#### Availabilities
- ✅ Create new availability entries (recurring or one-time)
- ✅ View all their availabilities
- ✅ Update existing availabilities
- ✅ Delete availabilities
- ✅ View availability calendar/slots

#### Missions
- ✅ View missions assigned to them (all statuses: pending, accepted, declined, cancelled)
- ✅ Accept mission invitations
- ✅ Decline mission invitations
- ✅ View mission details (title, description, schedules, dates)
- ✅ View mission schedules

#### Reports
- ✅ Create new reports for their missions
- ✅ View reports they created
- ✅ Update their own reports (draft status)
- ✅ Send reports to structures (change status from draft to sent)
- ✅ Delete their own reports
- ✅ View reports for missions they're assigned to

#### Structure Memberships
- ✅ View structure invitations received
- ✅ Accept structure invitations
- ✅ Decline structure invitations
- ✅ View structures they belong to
- ✅ Leave structures (soft delete membership)

#### Subscription Management
- ✅ View subscription status
- ✅ Create checkout session (if not already subscribed)
- ✅ Access Stripe customer portal
- ✅ Cancel subscription
- ✅ Reactivate subscription (if canceled)

### ❌ Restricted for Non-Subscribed Professionals

#### Profile Management
- ✅ View their own professional profile (allowed)
- ✅ Edit basic profile information (allowed - may be restricted in future)
- ❌ **Update availability status** (`is_available` flag) - **RESTRICTED**

#### Availabilities
- ❌ **Create new availability entries** - **RESTRICTED**
- ❌ **Update existing availabilities** - **RESTRICTED**
- ❌ **Delete availabilities** - **RESTRICTED**
- ✅ View their existing availabilities (read-only)
- ❌ **View availability calendar/slots** - **RESTRICTED** (or read-only)

#### Missions
- ✅ View missions assigned to them (read-only)
- ❌ **Accept mission invitations** - **RESTRICTED**
- ✅ Decline mission invitations (allowed - they can decline)
- ✅ View mission details (read-only)
- ❌ **View mission schedules** - **RESTRICTED** (or read-only)

#### Reports
- ❌ **Create new reports** - **RESTRICTED**
- ✅ View existing reports they created (read-only)
- ❌ **Update their reports** - **RESTRICTED**
- ❌ **Send reports to structures** - **RESTRICTED**
- ❌ **Delete their reports** - **RESTRICTED**

#### Structure Memberships
- ✅ View structure invitations received (read-only)
- ❌ **Accept structure invitations** - **RESTRICTED**
- ✅ Decline structure invitations (allowed)
- ✅ View structures they belong to (read-only)
- ❌ **Leave structures** - **RESTRICTED** (or allowed - TBD)

#### Subscription Management
- ✅ View subscription status (always allowed)
- ✅ Create checkout session (always allowed - needed to subscribe)
- ❌ Access Stripe customer portal (only if subscribed)
- ❌ Cancel subscription (only if subscribed)
- ❌ Reactivate subscription (only if subscribed)

## Implementation Guidelines

### Where to Implement Checks

1. **Database Level (RLS Policies)**
   - Add subscription checks to RLS policies for INSERT, UPDATE, DELETE operations
   - Keep SELECT policies open for read-only access where appropriate
   - Use `is_professional_subscribed(auth.uid())` function in RLS policies

2. **API Level (Edge Functions)**
   - Check subscription status before processing mutations
   - Return appropriate error messages (403 Forbidden with clear message)
   - Use `isProfessionalSubscribed()` service function

3. **Frontend Level (UI/UX)**
   - Disable/hide action buttons for non-subscribed users
   - Show subscription prompts/CTAs when restricted actions are attempted
   - Display subscription status banner/indicator
   - Redirect to subscription page when needed

### Error Messages

When a non-subscribed professional attempts a restricted action:

**API Response:**
```json
{
  "error": "SUBSCRIPTION_REQUIRED",
  "message": "A subscription is required to perform this action. Please subscribe to continue.",
  "code": 403
}
```

**Frontend Display:**
- Show modal/dialog with subscription CTA
- Link to subscription checkout page
- Explain which feature requires subscription

### RLS Policy Examples

#### Example: Restrict Availability Creation
```sql
CREATE POLICY "Subscribed professionals can create availabilities"
ON "public"."availabilities"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = "user_id"
  AND public.is_professional_subscribed((SELECT auth.uid()))
);
```

#### Example: Restrict Mission Acceptance
```sql
CREATE POLICY "Subscribed professionals can accept missions"
ON "public"."missions"
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = "professional_id"
  AND public.is_professional_subscribed((SELECT auth.uid()))
)
WITH CHECK (
  (SELECT auth.uid()) = "professional_id"
  AND public.is_professional_subscribed((SELECT auth.uid()))
);
```

#### Example: Restrict Report Creation
```sql
CREATE POLICY "Subscribed professionals can create reports"
ON "public"."reports"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = "author_id"
  AND public.is_professional_subscribed((SELECT auth.uid()))
);
```

### Frontend Hook Example

```typescript
// Check subscription before allowing action
const { data: subscriptionStatus } = useSubscriptionStatus();

const handleCreateAvailability = () => {
  if (!subscriptionStatus?.isSubscribed) {
    // Show subscription modal
    setShowSubscriptionModal(true);
    return;
  }
  // Proceed with creation
  createAvailability();
};
```

## Trial Period Behavior

During the **trial period** (90 days), professionals have:
- ✅ Full access to all subscribed features
- ✅ Same permissions as active subscribers
- ⚠️ Should be notified when trial is ending (7 days before)
- ⚠️ Should be prompted to add payment method before trial ends

## Grace Period Considerations

For professionals with `past_due` status:
- ⚠️ **TBD**: Should they retain access for a grace period?
- ⚠️ **TBD**: How long should the grace period be?
- ⚠️ **TBD**: Should they see warnings about payment issues?

**Recommendation**:
- Allow access during `past_due` status for 7-14 days
- Show prominent payment warning
- Restrict access after grace period expires

## Migration Strategy

When implementing these restrictions:

1. **Phase 1**: Add RLS policies (database level)
   - Test with existing subscribed professionals
   - Ensure no breaking changes

2. **Phase 2**: Add API-level checks (Edge Functions)
   - Add subscription validation in handlers
   - Return appropriate error codes

3. **Phase 3**: Update frontend (UI/UX)
   - Add subscription checks in hooks/components
   - Add subscription prompts/modals
   - Update navigation/UI to show subscription status

4. **Phase 4**: Testing
   - Test with subscribed professionals (should work)
   - Test with non-subscribed professionals (should be restricted)
   - Test trial period behavior
   - Test edge cases (past_due, canceled, etc.)

## Notes

- **Read-only access**: Non-subscribed professionals can view their data but cannot modify it
- **Subscription prompts**: Should be contextual and helpful, not intrusive
- **Existing data**: Non-subscribed professionals can still view their existing data (missions, reports, etc.)
- **Invitation responses**: Non-subscribed professionals can decline invitations but cannot accept them
- **Profile editing**: Basic profile editing may remain available, but availability status changes should be restricted

## Future Considerations

- **Feature tiers**: Consider different subscription tiers with different feature access
- **Usage limits**: Consider limits on number of missions, reports, etc. per subscription tier
- **Analytics**: Track which features drive subscriptions
- **Onboarding**: Guide new professionals through subscription during onboarding
