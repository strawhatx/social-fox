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
- **Explore Plan** ($9/month): 30 drafts (10 ideas × 3 variations), 10 scheduled posts, template access
- **Creator Plan** ($29/month): 120 drafts (40 ideas × 3 variations), 75 scheduled posts, template access, priority support

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Neon
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI GPT models
- **Deployment**: Netlify
 - **Infrastructure**: AWS Lambda (webhooks & scheduler), Amazon S3 (media uploads)

### Key Systems
- **Feature-Based Quota System**: Centralized usage tracking and limits
- **Subscription Management**: Stripe integration with webhooks (AWS Lambda)
- **Conversation Persistence**: Real-time chat with message history
- **Usage Tracking**: Monthly billing period usage monitoring
 - **Background Scheduler**: AWS EventBridge + Lambda for publishing

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── conversations/ # Chat/conversation endpoints
│   │   ├── stripe/         # Stripe checkout and billing routes
│   │   └── usage/         # Usage tracking
│   ├── editor/            # Main chat interface
│   └── scheduler/         # Content scheduling
├── components/            # React components
│   ├── chat/             # Chat UI components
│   ├── editor/           # Content editing tools
│   └── subscription/     # Payment/subscription UI
├── lib/                  # Core utilities
│   ├── features.ts       # Feature definitions
│   └── subscriptions.ts  # Subscription + usage management
└── db/                   # Database migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account for authentication
- Stripe account for payments
 - AWS account for webhooks/scheduler

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
   CLERK_SECRET_KEY="sk_..."
   
   # Payments
   STRIPE_SECRET_KEY="sk_..."
   SITE_URL="https://yourdomain.com"
   
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
SUBSCRIPTION_PLANS: = {
  explore: {
    id: 'explore',
    name: 'Explore',
    price: 9,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'explore',
    buttonText: 'Upgrade to Explore',
    features: [
      '30 drafts(10 ideas x 3  variations)',
      '10 scheduled posts',
      'Template library access',
      '1 X account',
      'Basic support'
    ],
    limits: {
      copilotDrafts: 10,
      scheduledPosts: 10,
      starterTemplates: true,
      customTemplates: true
    }
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 29,
    popular: true,
    interval: 'month',
    period: 'month',
    action: 'creator',
    buttonText: 'Upgrade to Creator',
    features: [
        '120 drafts(40 ideas x 3 variations)',
        '75 scheduled posts',
        'Template library access',
        '1 X account',
        'Priority support'
    ],
    limits: {
      copilotDrafts: 40,
      scheduledPosts: 75,
      starterTemplates: true,
      customTemplates: true
    }
  }
};
```

### Lemon Squeezy Integration

#### Pricing Setup
1. Create recurring Prices in the Stripe Dashboard for each plan.
2. Use the generated Price IDs with checkout.

#### Checkout
- Endpoint: `POST /api/stripe/checkout`
- Body: `{ "priceId": "price_XXX" }`
- Returns: `{ url }` to redirect to Checkout
- Requires env: `STRIPE_SECRET_KEY`, `SITE_URL`

#### Billing Portal
- Endpoint: `POST /api/stripe/billing-portal`
- Returns: `{ url }` to redirect to Billing Portal

#### Webhooks on AWS
- Stripe webhooks are handled by an AWS Lambda behind API Gateway (not Next.js).
- Configure events like `checkout.session.completed`, `customer.subscription.updated`, `invoice.paid`, `customer.subscription.deleted`.
- Lambda verifies signatures with `STRIPE_WEBHOOK_SECRET` and updates your database.

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
import { canUseFeatureDetailed, incrementFeatureQuota } from '@/lib/subscriptions';

// Check if user can use a feature
const access = await canUseFeatureDetailed(userId, 'copilotDrafts');
if (!access.canUse) {
  return NextResponse.json({ 
    error: access.reason,
    upgradeRequired: true 
  }, { status: 402 });
}

// Increment usage after successful action
const ok = await incrementFeatureQuota(userId, 'copilotDrafts');
```

### Getting Usage Data

```typescript
import { getAllUserUsage, getUserUsage } from '@/lib/subscriptions';

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

# (If testing AWS webhooks locally, use a tool like AWS SAM or expose your API Gateway test stage.)
```

### Testing Subscriptions (Stripe)
1. Create a test user in your app (Clerk test environment).
2. Call `POST /api/stripe/checkout` with a Stripe test Price ID.
3. Complete checkout with a Stripe test card (e.g., 4242 4242 4242 4242).
4. Confirm the AWS webhook Lambda processes events and updates the user's subscription.
5. Verify database updates and test feature access in the app.

## 🚀 Deployment

### Netlify (GitHub Actions)

- Uses workflow at `./.github/workflows/deploy-netlify.yml`.
- Builds and deploys with Netlify CLI: `netlify deploy --build --prod`, honoring `netlify.toml`.
- `netlify.toml` sets `publish = ".next"` and enables the Next.js plugin.
- Required repository secrets:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
- Build-time envs forwarded by the workflow (set as repo secrets as needed):
  - `CLERK_SECRET_KEY`, `NEXT_PUBLIC_GIPHY_API_KEY`, `DATABASE_URL`, `SITE_URL`, `STRIPE_SECRET_KEY`, `GEMINI_KEY`, `OPENAI_API_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

Troubleshooting:
- If you see `ENOENT: no such file or directory, lstat '.../out'`, ensure the workflow uses Netlify CLI and that `publish = ".next"` is set in `netlify.toml` (this app does not use `next export`).

### Environment Variables

```bash
# Production environment variables
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXX
SITE_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
CLERK_SECRET_KEY=sk_live_...

# AI
OPENAI_API_KEY=sk-...

# AWS (serverless webhooks & scheduler)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Database Migration

```bash
# Apply migrations
npm run db:migrate

# Generate Prisma client
npx prisma generate
```

### Webhook Configuration (Stripe on AWS)

Point Stripe webhooks to your API Gateway endpoint backed by the Lambda handler, for example:
```
https://<api-id>.execute-api.<region>.amazonaws.com/prod/stripe/webhook
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
# Check webhook endpoint (AWS API Gateway)
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/prod/stripe/webhook \
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