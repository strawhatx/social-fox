# Centralized Feature Management System

This system provides a single source of truth for managing features and their limits across different user plans.

## 🎯 Benefits

- **Single Configuration**: All features and limits defined in one place
- **Easy Updates**: Change limits or add features without touching multiple files
- **Type Safety**: Full TypeScript support with proper interfaces
- **Consistent UX**: Standardized upgrade prompts and usage indicators
- **Scalable**: Easy to add new features and plans

## 📁 Files Structure

```
lib/
├── features.ts          # Feature definitions and configuration
├── feature-access.ts    # Database integration and access checks
components/
├── feature-guard.tsx    # React components for feature protection
├── feature-examples.tsx # Usage examples
app/api/
└── feature-access/      # API endpoint for feature checks
```

## 🔧 Configuration

### Adding a New Feature

Edit `lib/features.ts`:

```typescript
export const FEATURES: Record<string, FeatureConfig> = {
  // ... existing features
  new_feature: {
    name: 'New Feature',
    description: 'Description of the new feature',
    limits: {
      free: 5,
      pro: 50,
      enterprise: 500
    },
    enabled: {
      free: true,
      pro: true,
      enterprise: true
    }
  }
};
```

### Adding a New Plan

```typescript
export const PLANS: Record<string, UserPlan> = {
  // ... existing plans
  premium: {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium'
  }
};
```

## 🚀 Usage

### 1. Protecting Features with Guards

```tsx
import { FeatureGuard } from '@/components/feature-guard';

function MyComponent() {
  return (
    <FeatureGuard featureName="ai_rewrites">
      <Button>Rewrite with AI</Button>
    </FeatureGuard>
  );
}
```

### 2. Custom Fallbacks

```tsx
<FeatureGuard 
  featureName="scheduling"
  fallback={<Button disabled>Upgrade Required</Button>}
>
  <Button>Schedule Post</Button>
</FeatureGuard>
```

### 3. Using the Hook

```tsx
import { useFeatureAccess } from '@/components/feature-guard';

function MyComponent() {
  const { access, loading } = useFeatureAccess('analytics');
  
  if (!access?.canUse) {
    return <UpgradePrompt />;
  }
  
  return <AnalyticsDashboard />;
}
```

### 4. Usage Indicators

```tsx
import { FeatureUsageIndicator } from '@/components/feature-guard';

function Dashboard() {
  return (
    <div>
      <FeatureUsageIndicator featureName="ai_posts" />
      <FeatureUsageIndicator featureName="ai_rewrites" />
    </div>
  );
}
```

### 5. API Integration

```typescript
// Check feature access
const access = await checkFeatureAccess(userId, 'ai_posts');

// Increment usage
const result = await incrementFeatureUsage(userId, 'ai_posts');

// Get all user features
const userAccess = await getUserFeatureAccess(userId);
```

## 🔄 Migration from Old System

### Before (Scattered Quota Checks)
```typescript
// In multiple files
const quota = await prisma.userQuota.findUnique({
  where: { userId: user.id }
});

if (quota && quota.aiPostsUsed >= quota.aiPostsLimit) {
  return NextResponse.json({ error: 'Quota exceeded' }, { status: 402 });
}
```

### After (Centralized)
```typescript
// Single import, consistent everywhere
const access = await checkFeatureAccess(user.id, 'ai_posts');

if (!access.canUse) {
  return NextResponse.json({ 
    error: access.reason,
    upgradeSuggestions: access.upgradeSuggestions 
  }, { status: 402 });
}
```

## 🎨 Customization

### Custom Upgrade Prompts

```tsx
<FeatureGuard 
  featureName="premium_feature"
  fallback={
    <div className="custom-upgrade-prompt">
      <h3>Premium Feature</h3>
      <p>This feature requires a premium subscription.</p>
      <Button onClick={() => router.push('/upgrade')}>
        Upgrade Now
      </Button>
    </div>
  }
>
  <PremiumFeature />
</FeatureGuard>
```

### Custom Usage Display

```tsx
function CustomUsageDisplay({ featureName }: { featureName: string }) {
  const { access } = useFeatureAccess(featureName);
  
  if (!access) return null;
  
  return (
    <div className="custom-usage">
      <span>{access.featureConfig.used}</span>
      <span>/</span>
      <span>{access.featureConfig.limit}</span>
    </div>
  );
}
```

## 🔧 Database Integration

The system integrates with your existing `user_quotas` table. Make sure your quota fields match the feature names:

- `ai_posts` → `aiPostsUsed`
- `ai_rewrites` → `aiRewritesUsed`  
- `posts` → `postsUsed`

## 🚀 Next Steps

1. **Implement Subscription Integration**: Update `getUserPlan()` in `feature-access.ts` to read from your subscription system
2. **Add More Features**: Define additional features in `features.ts`
3. **Customize UI**: Modify the guard components to match your design system
4. **Add Analytics**: Track feature usage for business insights

## 🐛 Troubleshooting

### Feature Not Working?
1. Check if feature is defined in `FEATURES`
2. Verify the feature name matches exactly
3. Ensure the quota field exists in your database
4. Check the user's plan assignment

### Upgrade Suggestions Not Showing?
1. Verify the feature has different limits across plans
2. Check that the current plan is correctly identified
3. Ensure the API endpoint is returning upgrade suggestions

This system makes feature management much more maintainable and provides a consistent user experience across your application!
