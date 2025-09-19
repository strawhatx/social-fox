# Social Fox

AI-powered social media content creation platform with intelligent conversation-based editing & scheduling.

## 🚀 Features

### Core Functionality
- **AI Copilot**: Interactive chat interface for creating and refining social media content
- **Conversation Management**: Persistent chat history with message threading
- **Content Scheduling**: Plan and schedule posts across social platforms
- **Template Library**: Pre-built templates for different content types
- **Usage Analytics**: Track engagement and performance metrics

### Subscription Plans
- **Explore Plan** ($5/month): 20 AI drafts, 10 scheduled posts, template access
- **Creator Plan** ($15/month): 150 AI drafts, 100 scheduled posts, custom templates

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Neon
- **Authentication**: Clerk
- **Payments**: Lemon Squeezy
- **AI**: OpenAI GPT models
- **Deployment**: Vercel

### Key Systems
- **Feature-Based Quota System**: Centralized usage tracking and limits
- **Subscription Management**: Lemon Squeezy integration with webhooks
- **Conversation Persistence**: Real-time chat with message history
- **Usage Tracking**: Monthly billing period usage monitoring

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── conversations/ # Chat/conversation endpoints
│   │   ├── lemonsqueezy/  # Payment webhooks
│   │   └── usage/         # Usage tracking
│   ├── editor/            # Main chat interface
│   └── scheduler/         # Content scheduling
├── components/            # React components
│   ├── chat/             # Chat UI components
│   ├── editor/           # Content editing tools
│   └── subscription/     # Payment/subscription UI
├── lib/                  # Core utilities
│   ├── features.ts       # Feature definitions
│   ├── usage-tracking.ts # Usage management
│   └── subscriptions.ts  # Payment integration
└── db/                   # Database migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account for authentication
- Lemon Squeezy account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-story-shaper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   ```bash
   # Database
   DATABASE_URL="postgresql://..."
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."
   
   # Payments
   LEMON_API_KEY="sk_..."
   LEMONSQUEEZY_WEBHOOK_SECRET="..."
   
   # AI
   OPENAI_API_KEY="sk-..."
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 💳 Subscription System

### Plan Configuration

```typescript
// Current subscription plans
export const SUBSCRIPTION_PLANS = {
  explore: {
    id: 'explore',
    name: 'Explore',
    price: 5,
    features: [
      'AI-powered social media posts',
      'Basic scheduling',
      'Template library access',
      '20 AI drafts per month',
      '10 scheduled posts per month'
    ],
    limits: {
      copilotDrafts: 20,
      scheduledPosts: 10,
      starterTemplates: true,
      customTemplates: false
    }
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 15,
    features: [
      'Everything in Explore',
      'Advanced AI features',
      'Custom template creation',
      '150 AI drafts per month',
      '100 scheduled posts per month',
      'Priority support'
    ],
    limits: {
      copilotDrafts: 150,
      scheduledPosts: 100,
      starterTemplates: true,
      customTemplates: true
    }
  }
};
```

### Lemon Squeezy Integration

#### Product Setup
1. **Create products** in Lemon Squeezy dashboard:
   - **Explore Plan**: $5/month (Product ID: 631823)
   - **Creator Plan**: $15/month (Product ID: 631761)

2. **Configure webhooks**:
   ```
   Webhook URL: https://yourdomain.com/api/lemonsqueezy/webhook
   Events: order_created, subscription_created, subscription_payment_success, etc.
   ```

#### User Binding Strategy
The webhook handler uses a robust multi-step user lookup:

1. **Clerk User ID** from custom data (most reliable)
2. **Twitter username** from custom data
3. **Email address** from webhook payload
4. **Existing subscription ID** lookup

#### Subscription Expiry
Subscriptions are set to expire 30 days from activation for testing purposes.

## 📊 Usage Tracking System

### Feature-Based Quota System

```typescript
// Feature definitions
export const QUOTA_FEATURES = {
  copilotDrafts: {
    name: 'Copilot Drafts',
    description: 'Generate AI-powered social media posts',
    limits: {
      explore: 20,
      creator: 150
    }
  },
  scheduledPosts: {
    name: 'Scheduled Posts',
    description: 'Schedule posts for future publishing',
    limits: {
      explore: 10,
      creator: 100
    }
  }
};

// Binary features
export const BINARY_FEATURES = {
  starterTemplates: {
    name: 'Starter Templates',
    enabled: { explore: true, creator: true }
  },
  customTemplates: {
    name: 'Custom Templates',
    enabled: { explore: false, creator: true }
  }
};
```

### Database Schema

```sql
-- User usage tracking
CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL,
    used INT DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature, period_start, period_end)
);

-- User subscription fields
ALTER TABLE users ADD COLUMN plan VARCHAR(50);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50);
ALTER TABLE users ADD COLUMN subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_expiry TIMESTAMP WITH TIME ZONE;
```

### Automatic Usage Management

- **Auto-initialization**: Usage records created when needed
- **Monthly reset**: Usage automatically resets at billing period start
- **Real-time tracking**: Usage incremented on successful actions
- **Quota enforcement**: Automatic upgrade prompts when limits reached

## 🔧 API Usage

### Protecting API Routes

```typescript
import { withQuotaCheck } from '@/lib/quota-middleware';

// Automatic quota checking and incrementing
export const POST = withQuotaCheck('copilotDrafts', async (request, context, user, usage) => {
  // Your API logic here
  // Usage is automatically incremented on success
  return NextResponse.json({ 
    success: true,
    usage: {
      used: usage.used,
      limit: usage.limit
    }
  });
});
```

### Manual Usage Checking

```typescript
import { canUseFeature, incrementFeatureUsage } from '@/lib/usage-tracking';

// Check if user can use a feature
const access = await canUseFeature(userId, 'copilotDrafts');
if (!access.canUse) {
  return NextResponse.json({ 
    error: access.reason,
    upgradeRequired: true 
  }, { status: 402 });
}

// Increment usage after successful action
const result = await incrementFeatureUsage(userId, 'copilotDrafts');
```

### Getting Usage Data

```typescript
import { getAllUserUsage, getUserUsage } from '@/lib/usage-tracking';

// Get all user usage
const allUsage = await getAllUserUsage(userId);

// Get specific feature usage
const aiUsage = await getUserUsage(userId, 'copilotDrafts');
```

## 🎨 Frontend Integration

### Subscription Components

```tsx
import { SubscriptionGuard } from '@/components/subscription/subscription-guard';
import { SubscriptionManager } from '@/components/subscription/subscription-manager';

// Protect pages
function ProtectedPage() {
  return (
    <SidebarLayout>
      <SubscriptionGuard>
        {/* Protected content */}
      </SubscriptionGuard>
    </SidebarLayout>
  );
}

// Show subscription management
function Dashboard() {
  return (
    <div>
      <SubscriptionManager />
    </div>
  );
}
```

### Usage Indicators

```typescript
// Get usage data for display
const response = await fetch('/api/usage');
const usage = await response.json();

// Display usage
usage.forEach(feature => {
  const percentage = (feature.used / feature.limit) * 100;
  console.log(`${feature.feature}: ${feature.used}/${feature.limit} (${percentage}%)`);
});
```

### Error Handling

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

## 🔒 Security

### Webhook Security
- **HMAC signature verification** for all webhooks
- **Middleware exclusion** for webhook endpoints
- **User binding validation** with multiple fallbacks

### Authentication
- **Clerk-based** user management
- **Server-side validation** for all subscription checks
- **Real-time updates** via webhook processing

## 🧪 Testing

### Local Development
```bash
# Start development server
npm run dev

# Start tunnel for webhook testing
npm run tunnel

# Test webhook
curl -X POST https://your-tunnel-url/api/lemonsqueezy/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### Testing Subscriptions
1. Create test user in your app
2. Purchase subscription through Lemon Squeezy
3. Verify webhook is received and processed
4. Check database for subscription updates
5. Test feature access with new subscription

## 🚀 Deployment

### Environment Variables

```bash
# Production environment variables
LEMON_API_KEY=sk_live_XXXXXXXXXXXXXXXX
LEMONSQUEEZY_WEBHOOK_SECRET=your_secure_webhook_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# AI
OPENAI_API_KEY=sk-...
```

### Database Migration

```bash
# Apply migrations
npm run db:migrate

# Generate Prisma client
npx prisma generate
```

### Webhook Configuration

Update webhook URL in Lemon Squeezy dashboard:
```
https://yourdomain.com/api/lemonsqueezy/webhook
```

## 📈 Monitoring

### Usage Analytics
- Real-time usage tracking
- Billing period management
- Feature adoption metrics
- User engagement analytics

### Business Metrics
- Conversion rates from free to paid
- Feature adoption across different plans
- Usage patterns and peak times
- Churn indicators and retention metrics

### Error Handling
- Comprehensive error logging
- Webhook failure recovery
- Subscription status monitoring
- Usage limit enforcement

## 🔧 Configuration

### Adding New Features

1. **Update feature definitions** in `lib/features.ts`:
```typescript
export const QUOTA_FEATURES = {
  newFeature: {
    name: 'New Feature',
    description: 'Description of the new feature',
    limits: {
      explore: 5,
      creator: 50
    }
  }
};
```

2. **Use in API routes**:
```typescript
export const POST = withQuotaCheck('newFeature', async (request, context, user, usage) => {
  // Your logic
});
```

### Adding New Plans

1. **Add to feature limits**:
```typescript
export const QUOTA_FEATURES = {
  copilotDrafts: {
    limits: {
      explore: 20,
      creator: 150,
      enterprise: 5000  // New plan
    }
  }
};
```

2. **Add to PLANS object**:
```typescript
export const PLANS = {
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 50
  }
};
```

## 🆘 Troubleshooting

### Common Issues

**Webhooks not working:**
- Check webhook URL accessibility
- Verify webhook secret configuration
- Check webhook event selection
- Review webhook delivery logs

**Subscription not updating:**
- Verify product ID mapping
- Check user binding logic
- Review webhook processing logs
- Test webhook manually

**Usage tracking issues:**
- Check database connection
- Verify user ID resolution
- Review usage tracking logic
- Check billing period calculation

### Debug Commands

```bash
# Check webhook endpoint
curl -X POST https://yourdomain.com/api/lemonsqueezy/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}' -v

# Check database
npx prisma studio

# Test usage
curl http://localhost:3000/api/usage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review error logs and monitoring
- Contact the development team

---

Built with ❤️ for content creators and social media managers.

**Ready to monetize your social media content creation platform!** 🚀