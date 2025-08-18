# Stripe Webhook Function

This Supabase Edge Function handles Stripe webhook events for payment processing and user credit management.

## Supported Events

- `checkout.session.completed`: Handles successful payments and adds credits to user accounts
- `customer.subscription.deleted`: Handles subscription cancellations and revokes user access
- `invoice.payment_succeeded`: Logs successful recurring payments
- `invoice.payment_failed`: Logs failed payments

## Environment Variables Required

Set these in your Supabase Edge Function environment:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook signing secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Service role key for database access
```

## Credit Configuration

Update the `PRICE_ID_TO_CREDITS` mapping in `index.ts` with your actual Stripe price IDs:

```typescript
const PRICE_ID_TO_CREDITS: Record<string, number> = {
  'price_1ABC123': 10,     // $0 for 100 credits
  'price_2DEF456': 50,     // $10 for 50 credits  
  'price_3GHI789': 58,    // $100 for 50 additional credits
};
```

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy stripe-webhook
```

## Webhook Endpoint

After deployment, configure your Stripe webhook endpoint to:
```
https://your-project.supabase.co/functions/v1/stripe-webhook
```

## Security

- The function verifies webhook signatures using your Stripe webhook secret
- Uses Supabase service role for secure database operations
- All database operations use the existing `update_user_credits` function with proper security policies

## Error Handling

- Invalid signatures return 400 status
- Processing errors return 500 status (causes Stripe to retry)
- Successful processing returns 200 status
- All errors are logged for debugging
