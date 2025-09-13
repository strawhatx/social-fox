# New Quota System Documentation

## 🎯 Overview

This new quota system provides centralized, plan-based feature limits with usage tracking per billing period. It replaces the old scattered quota checks with a clean, maintainable architecture.

## 🏗️ Architecture

### Core Components

1. **Plan Limits** (`lib/features.ts`) - Single source of truth for all limits
2. **Usage Tracking** (`lib/usage-tracking.ts`) - Database operations for usage
3. **Quota Middleware** (`lib/quota-middleware.ts`) - API route protection
4. **User Usage Table** - PostgreSQL table for tracking actual usage

### Plan Structure

```typescript
const planLimits = {
  explore: { 
    copilotDrafts: 20, 
    scheduledPosts: 10, 
    starterTemplates: true,
    customTemplates:false,
    
  },
  creator: { 
    copilotDrafts: 150, 
    scheduledPosts: 100, 
    starterTemplates: true,
    customTemplates:true
  }
};

// Plan definitions with pricing
const PLANS = {
  explore: {
    id: 'explore',
    name: 'explore',
    displayName: 'Explore',
    price: 5
  },
  creator: {
    id: 'creator',
    name: 'creator',
    displayName: 'Creator',
    price: 29
  }
};
```

## 📊 Database Schema

### User Usage Table

```sql
CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL, -- "copilotDrafts", "scheduledPosts", "projects"
    used INT DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

- **Period-based tracking**: Usage resets monthly
- **Feature-specific**: Each feature tracked separately
- **Unique constraints**: Prevents duplicate records
- **Efficient indexing**: Fast queries by user/feature/period

## 🔧 Usage

### 1. Protecting API Routes

```typescript
import { withQuotaCheck } from '@/lib/quota-middleware';

// Wrap your API route with quota checking
export const POST = withQuotaCheck('copilotDrafts', async (request, context, user, usage) => {
  // Your API logic here
  // Usage is automatically incremented on success
  return NextResponse.json({ success: true });
});
```

### 2. Manual Quota Checking

```typescript
import { canUseFeature, incrementFeatureUsage } from '@/lib/usage-tracking';

// Check if user can use a feature
const access = await canUseFeature(userId, 'copilotDrafts');
if (!access.canUse) {
  throw new Error(access.reason);
}

// Increment usage after successful action
const result = await incrementFeatureUsage(userId, 'copilotDrafts');
```

### 3. Getting Usage Data

```typescript
import { getAllUserUsage, getUserUsage } from '@/lib/usage-tracking';

// Get all user usage
const allUsage = await getAllUserUsage(userId);

// Get specific feature usage
const aiUsage = await getUserUsage(userId, 'copilotDrafts');
```

## 🚀 API Endpoints

### GET /api/usage

Get current usage for all features or a specific feature.

**Query Parameters:**
- `feature` (optional): Specific feature to check

**Response:**
```json
{
  "userId": "uuid",
  "feature": "copilotDrafts",
  "used": 15,
  "limit": 20,
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

## 🔄 Migration from Old System

### Before (Old System)
```typescript
// Scattered quota checks
const quota = await prisma.userQuota.findUnique({
  where: { userId: user.id }
});

if (quota && quota.aiPostsUsed >= quota.aiPostsLimit) {
  return NextResponse.json({ error: 'Quota exceeded' }, { status: 402 });
}

// Manual increment
await prisma.userQuota.update({
  where: { userId: user.id },
  data: { aiPostsUsed: { increment: 1 } }
});
```

### After (New System)
```typescript
// Clean middleware wrapper
export const POST = withQuotaCheck('copilotDrafts', async (request, context, user, usage) => {
  // Your logic here
  // Quota checking and incrementing handled automatically
});
```

## 📈 Billing Cycle Management

### Automatic Reset

Usage automatically resets at the start of each billing period (monthly). The system:

1. **Creates new usage records** for each feature at period start
2. **Tracks usage separately** for each period
3. **Provides historical data** for analytics

### Manual Reset (for testing)

```typescript
import { resetUsageForNewPeriod } from '@/lib/usage-tracking';

// Reset usage for a user (typically called by cron job)
await resetUsageForNewPeriod(userId);
```

## 🎨 Frontend Integration

### Usage Indicators

```typescript
// Get usage data for display
const response = await fetch('/api/usage');
const usage = await response.json();

// Display usage
usage.forEach(feature => {
  console.log(`${feature.feature}: ${feature.used}/${feature.limit}`);
});
```

### Quota Error Handling

```typescript
try {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title, firstMessage })
  });
  
  if (response.status === 402) {
    const error = await response.json();
    // Show upgrade prompt with error.usage data
    showUpgradePrompt(error.usage);
  }
} catch (error) {
  // Handle other errors
}
```

## 🔧 Configuration

### Adding New Features

1. **Update plan limits** in `lib/features.ts`:
```typescript
const planLimits = {
  free: { 
    copilotDrafts: 20, 
    scheduledPosts: 10, 
    projects: 1,
    newFeature: 5  // Add new feature
  },
  // ... other plans
};
```

2. **Use in API routes**:
```typescript
export const POST = withQuotaCheck('newFeature', async (request, context, user, usage) => {
  // Your logic
});
```

### Changing Limits

Simply update the numbers in `planLimits` - all API routes automatically use the new limits.

### Adding New Plans

1. **Add to plan limits**:
```typescript
const planLimits = {
  // ... existing plans
  enterprise: { 
    copilotDrafts: 5000, 
    scheduledPosts: Infinity, 
    projects: 50 
  }
};
```

2. **Add to PLANS object**:
```typescript
const PLANS = {
  // ... existing plans
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 50
  }
};
```

3. **Update plan mapping** in `getUserPlan()` function

## 🚨 Error Handling

### Quota Exceeded (402)

```json
{
  "error": "Usage limit reached for this billing period",
  "usage": {
    "userId": "uuid",
    "feature": "copilotDrafts",
    "used": 20,
    "limit": 20,
    "period": { "start": "...", "end": "..." }
  },
  "upgradeRequired": true
}
```

### Unauthorized (401)

```json
{
  "error": "Unauthorized"
}
```

### User Not Found (404)

```json
{
  "error": "User not found"
}
```

## 🔍 Monitoring & Analytics

### Usage Analytics

```typescript
// Get usage for analytics
const usage = await getAllUserUsage(userId);

// Calculate usage percentage
const percentage = (usage.used / usage.limit) * 100;

// Check if approaching limit
const isNearLimit = percentage > 80;
```

### Business Metrics

- **Feature adoption**: Track which features are used most
- **Plan conversion**: Monitor usage patterns before upgrades
- **Churn prediction**: Identify users hitting limits frequently

## 🛠️ Development

### Testing

```typescript
// Mock usage for testing
const mockUsage = {
  userId: 'test-user',
  feature: 'copilotDrafts',
  used: 0,
  limit: 20,
  period: getCurrentBillingPeriod()
};
```

### Local Development

1. **Run migrations**: `npm run db:migrate`
2. **Generate Prisma client**: `npx prisma generate`
3. **Test API endpoints**: Use the `/api/usage` endpoint

## 🚀 Deployment

### Database Migration

```bash
# Apply the new migration
npm run db:migrate
```

### Environment Variables

No new environment variables required - uses existing `DATABASE_URL`.

## 📋 Checklist

- [x] Create user_usage table migration
- [x] Update Prisma schema
- [x] Create usage tracking utilities
- [x] Create quota middleware
- [x] Update API routes
- [x] Create usage API endpoint
- [ ] Update frontend components
- [ ] Add usage indicators to UI
- [ ] Set up billing cycle reset cron job
- [ ] Add usage analytics dashboard

This new system provides a clean, scalable foundation for managing feature limits and usage tracking across your application!
