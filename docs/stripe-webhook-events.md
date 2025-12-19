# Stripe Webhook Events

This document lists all Stripe events that are handled by the webhook handler.

## Webhook Endpoint

- **Path**: `/stripe-webhooks`
- **Method**: `POST`
- **Location**: `supabase/functions/stripe-webhooks/handlers/webhookHandler.ts`

## Security

- Webhook signature verification using `STRIPE_WEBHOOK_SECRET`
- Only verified webhooks are processed
- Webhook endpoint does not require JWT authentication (uses signature verification instead)

## Handled Events

### 1. `customer.subscription.created`

**Description**: Triggered when a new subscription is created.

**Action**:
- Syncs the subscription data from Stripe to the database using `syncSubscriptionFromStripe()`
- Creates a new subscription record in the `subscriptions` table

**Code Location**: Lines 109-127

---

### 2. `customer.subscription.updated`

**Description**: Triggered when a subscription is updated (status change, period change, plan change, etc.).

**Action**:
- Syncs the updated subscription data from Stripe to the database using `syncSubscriptionFromStripe()`
- Updates the existing subscription record in the `subscriptions` table

**Code Location**: Lines 109-127

---

### 3. `customer.subscription.deleted`

**Description**: Triggered when a subscription is canceled or deleted.

**Action**:
- Updates the subscription status to `'canceled'` in the database
- Sets the `canceled_at` timestamp to the current date
- Only processes if the subscription metadata contains a `user_id`

**Code Location**: Lines 129-143

---

### 4. `customer.subscription.trial_will_end`

**Description**: Triggered when a subscription's trial period is about to end (typically 3 days before).

**Action**:
- Syncs the subscription data from Stripe to the database using `syncSubscriptionFromStripe()`
- Updates subscription dates and trial information

**Code Location**: Lines 145-153

---

### 5. `invoice.payment_failed`

**Description**: Triggered when a payment attempt on an invoice fails.

**Action**:
- Retrieves the associated subscription from Stripe
- Syncs the subscription data to the database using `syncSubscriptionFromStripe()`
- Updates the subscription status (typically to `'past_due'`)

**Code Location**: Lines 155-173

---

### 6. `invoice.payment_succeeded`

**Description**: Triggered when a payment on an invoice succeeds.

**Action**:
- Retrieves the associated subscription from Stripe
- Syncs the subscription data to the database using `syncSubscriptionFromStripe()`
- Updates the subscription status (typically to `'active'`)

**Code Location**: Lines 175-193

---

## Unhandled Events

Any event type that is not explicitly handled in the switch statement will:
- Log a warning: `Unhandled event type: {event.type}`
- Return a successful response (200 OK) to prevent Stripe from retrying

**Code Location**: Lines 195-197

---

## Event Processing Flow

1. Webhook receives POST request from Stripe
2. Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
3. Parse the event type from the webhook payload
4. Route to appropriate handler based on event type
5. Execute database operations using Supabase Admin Client
6. Return 200 OK response to Stripe

## Error Handling

- If webhook signature verification fails, returns 400 Bad Request
- If subscription sync fails, error is logged and re-thrown
- All errors are logged with context (event type, subscription ID, etc.)
- Errors return 500 Internal Server Error to Stripe
