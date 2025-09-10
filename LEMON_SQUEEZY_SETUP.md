# Lemon Squeezy Integration Setup Guide

## 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Lemon Squeezy Configuration
LEMON_API_KEY=sk_live_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your Lemon Squeezy Product IDs (replace with your actual product IDs)
LEMON_EXPLORE_PRODUCT_ID=631823
LEMON_CREATIVE_PRODUCT_ID=631761
```

## 2. Database Migration

Run the migration to add subscription fields to your users table:

```bash
npm run db:migrate
```

## 3. Lemon Squeezy Product Setup

1. Create products in your Lemon Squeezy dashboard:
   - **Explore Plan**: $5/month with 50 posts limit
   - **Creative Plan**: $14/month with unlimited posts

2. Copy the product IDs and update your environment variables

3. Set up webhooks in Lemon Squeezy:
   - Webhook URL: `https://yourdomain.com/api/lemonsqueezy/webhook`
   - Events to listen for:
     - `order_created`
     - `subscription_created`
     - `subscription_renewed`
     - `subscription_cancelled`
     - `subscription_expired`
     - `subscription_paused`
     - `subscription_resumed`

## 4. Update Product ID Mapping

In `/lib/subscriptions.ts`, update the `determinePlanFromProduct` function with your actual product IDs:

```typescript
function determinePlanFromProduct(productId: string, variantId?: string): string {
  const planMapping: Record<string, string> = {
    'your-actual-explore-product-id': 'explore',
    'your-actual-creative-product-id': 'creative',
  };
  // ... rest of the function
}
```

## 5. Update Checkout URLs

In `/components/subscription-manager.tsx`, update the product IDs:

```typescript
const productIds: Record<string, string> = {
  explore: 'your-actual-explore-product-id',
  creative: 'your-actual-creative-product-id'
};
```

## 6. Test the Integration

1. Start your development server
2. Create a test subscription in Lemon Squeezy
3. Verify webhooks are received and processed
4. Test the customer portal functionality

## 7. Feature Gating

The system now automatically gates features based on subscription status:

- **Free Plan**: No access to main features
- **Explore Plan**: 50 posts/month, full Tweet Builder access
- **Creative Plan**: Unlimited posts, all features

## 8. Usage

### Check User Subscription
```typescript
import { getUserSubscription } from '@/lib/subscriptions';

const subscription = await getUserSubscription(userId);
```

### Check Feature Access
```typescript
import { checkFeatureAccess } from '@/lib/subscriptions';

const canPost = await checkFeatureAccess(userId, 'posts');
```

### Check Quota Limits
```typescript
import { checkQuotaLimit } from '@/lib/subscriptions';

const quota = await checkQuotaLimit(userId, 'posts');
// Returns: { allowed: boolean, used: number, limit: number }
```

## 9. UI Components

Use the `SubscriptionManager` component in your dashboard:

```tsx
import SubscriptionManager from '@/components/subscription-manager';

// In your dashboard page
<SubscriptionManager />
```

## 10. Webhook Security

The webhook endpoint verifies signatures using your `LEMON_API_KEY`. Make sure to:

1. Keep your API key secure
2. Use HTTPS in production
3. Monitor webhook logs for any issues

## Troubleshooting

- **Webhooks not working**: Check your webhook URL and ensure it's accessible
- **Subscription not updating**: Verify product ID mapping in the code
- **Quota issues**: Check the `checkQuotaLimit` function and database queries
- **Customer portal not working**: Ensure your `NEXT_PUBLIC_APP_URL` is set correctly
