# Paywall System Setup Guide

## Overview

Your app now has a complete paywall system that requires users to have an active subscription to access the main features (Tweet Builder, Library, and Scheduler).

## How It Works

### 1. Subscription Guard
- **Component**: `SubscriptionGuard` wraps protected pages
- **Function**: Checks if user has active subscription
- **Behavior**: 
  - If active subscription → Shows the page content
  - If no active subscription → Shows payment modal

### 2. Protected Pages
The following pages are now protected and require an active subscription:
- **X Copilot** (`/editor`)
- **Library** (`/library`) 
- **Scheduler** (`/scheduler`)

### 3. Payment Modal
When users try to access protected features without a subscription:
- Shows a beautiful payment modal with plan options
- Direct integration with Lemon Squeezy checkout
- Displays current subscription status
- Allows subscription management

### 4. Subscription Status
- **Sidebar Indicator**: Shows current plan and status
- **Real-time Updates**: Updates when subscription changes
- **Visual Cues**: Crown icon for paid plans, lock icon for free

## User Experience

### Free Users
- Can see the dashboard (if you want to allow it)
- Cannot access Tweet Builder, Library, or Scheduler
- See payment modal when trying to access protected features
- Clear upgrade prompts throughout the interface

### Paid Users
- Full access to all features
- Subscription status shown in sidebar
- Can manage subscription through customer portal

## Configuration

### 1. Update Product IDs
In `/components/subscription-guard.tsx`, update the product IDs:

```typescript
const productIds: Record<string, string> = {
  explore: 'your-actual-explore-product-id',
  creative: 'your-actual-creative-product-id'
};
```

### 2. Plan Limits
In `/lib/subscriptions.ts`, customize the plan limits:

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    // Free plan limits
    limits: {
      monthlyPosts: 0,
      aiRewrites: 0,
      scheduledPosts: 0
    }
  },
  explore: {
    // Explore plan limits
    limits: {
      monthlyPosts: 50,
      aiRewrites: 100,
      scheduledPosts: 25
    }
  },
  creative: {
    // Creative plan limits (unlimited)
    limits: {
      monthlyPosts: -1, // -1 means unlimited
      aiRewrites: -1,
      scheduledPosts: -1
    }
  }
};
```

### 3. Add More Protected Pages
To protect additional pages, wrap them with `SubscriptionGuard`:

```tsx
import SubscriptionGuard from '@/components/subscription-guard';

export default function MyProtectedPage() {
  return (
    <SidebarLayout>
      <SubscriptionGuard>
        {/* Your page content */}
      </SubscriptionGuard>
    </SidebarLayout>
  );
}
```

### 4. Custom Fallback
You can provide a custom fallback UI instead of the default payment modal:

```tsx
<SubscriptionGuard fallback={<MyCustomUpgradeUI />}>
  {/* Protected content */}
</SubscriptionGuard>
```

## Testing

### 1. Test Free User Experience
- Create a test user with free plan
- Try to access protected pages
- Verify payment modal appears
- Test checkout flow

### 2. Test Paid User Experience
- Create a test user with active subscription
- Verify full access to all features
- Test subscription management

### 3. Test Subscription Changes
- Use Lemon Squeezy webhooks to test subscription updates
- Verify UI updates in real-time
- Test plan upgrades/downgrades

## Customization

### 1. Payment Modal Styling
The payment modal uses your social fox theme:
- Orange/blue gradient background
- Orange accent colors
- Consistent with your app design

### 2. Subscription Status Colors
- **Free Plan**: Orange lock icon
- **Active Subscription**: Crown icon with green badge
- **Inactive Subscription**: Crown icon with orange badge

### 3. Plan Features
Customize the features shown in the payment modal by updating the `SUBSCRIPTION_PLANS` in `/lib/subscriptions.ts`.

## Security

- **Server-side Validation**: All subscription checks happen server-side
- **Webhook Verification**: Lemon Squeezy webhooks are verified with HMAC signatures
- **Real-time Updates**: Subscription status updates immediately via webhooks

## Support

If users have subscription issues:
1. They can use the "Manage Subscription" button in the payment modal
2. This opens the Lemon Squeezy customer portal
3. They can update payment methods, cancel, or upgrade there

The system is now fully functional and ready to monetize your social story shaper app! 🚀
