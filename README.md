# Social Fox

AI-powered social media content creation platform with intelligent conversation-based editing & scheduling.

## 🚀 Features

### Core Functionality
- **AI Copilot**: Interactive chat interface for creating and refining social media content
- **30-Day Content Calendar**: Visual calendar for planning and scheduling posts with drag & drop
- **Thread Planner**: Plan and publish multi-tweet threads with clean structure and CTAs
- **Analytics Dashboard**: Track which posts are driving followers, replies, and clicks
- **Content Library**: Save, remix, and auto-fill winning posts
- **AI Rewriter**: Rewrite posts with AI to make them more engaging and viral
- **Playbooks**: Pre-built strategies for consistency, AI threads, and clarity templates
- **Twitter/X Integration**: Direct publishing and analytics integration

### Subscription Plans
- **Launch Plan** ($19/month): 30 scheduled posts/mo, up to 4 threads, limited analytics, content library access
- **Grow Plan** ($49/month): 60 scheduled posts/mo, 8 threads, analytics included, partial AI automation, full content library access
- **Scale Plan** ($99/month): 150 scheduled posts/mo, 15 threads, full AI automation, team access, priority support

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Neon
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI GPT models, Gemini AI
- **Storage**: AWS S3 for media uploads
- **Social Integration**: Twitter/X API
- **UI Components**: Radix UI, Lucide React icons, Framer Motion
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
│   │   ├── analytics/     # Analytics data endpoints
│   │   ├── conversations/ # Chat/conversation endpoints
│   │   ├── content-posts/ # Content post management
│   │   ├── library/       # Content library endpoints
│   │   ├── s3/            # File upload endpoints
│   │   ├── stripe/        # Stripe checkout and billing routes
│   │   └── usage/         # Usage tracking
│   ├── calendar/          # Content calendar interface
│   ├── features/          # Feature showcase pages
│   │   ├── analytics/     # Analytics dashboard
│   │   └── thread-planner/ # Thread planning tool
│   ├── integrations/      # Third-party integrations
│   │   └── twitter/       # Twitter/X integration
│   ├── library/           # Content library interface
│   ├── playbooks/         # Strategy playbooks
│   │   ├── ai-threads/    # AI thread strategies
│   │   ├── clarity-templates/ # Clarity templates
│   │   └── consistency/   # Consistency strategies
│   └── comparison/        # Competitor comparisons
├── components/            # React components
│   ├── calendar/          # Calendar UI components
│   ├── chat/             # Chat UI components
│   ├── editor/           # Content editing tools
│   ├── landing/          # Landing page components
│   └── subscription/     # Payment/subscription UI
├── lib/                  # Core utilities
│   ├── features.ts       # Feature definitions
│   ├── subscriptions.ts  # Subscription + usage management
│   ├── s3.ts            # AWS S3 integration
│   └── twitter.ts       # Twitter API integration
└── prisma/              # Database schema and migrations
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
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   
   # Payments
   STRIPE_SECRET_KEY="sk_..."
   SITE_URL="https://yourdomain.com"
   
   # AI
   OPENAI_API_KEY="sk-..."
   GEMINI_KEY="..."
   
   # AWS
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your-bucket"
   AWS_ACCESS_KEY_ID="..."
   AWS_SECRET_ACCESS_KEY="..."
   
   # Social Media
   NEXT_PUBLIC_GIPHY_API_KEY="..."
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
SUBSCRIPTION_PLANS = {
  launch: {
    id: 'launch',
    name: 'Never Miss a Post Again',
    price: 19,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'launch',
    buttonText: 'Choose Tier 1',
    features: [
      '30 scheduled posts/mo',
      'Up to 4 threads',
      'Limited analytics',
      'Access to content library (view only)'
    ],
    limits: {
      scheduledPosts: 30,
      threads: 4,
      analytics: true,
      automation: false,
      contentLibrary: true,
      aiGeneration: false
    }
  },
  grow: {
    id: 'grow',
    name: 'Grow Your Reach',
    price: 49,
    popular: true,
    interval: 'month',
    period: 'month',
    action: 'grow',
    buttonText: 'Choose Tier 2',
    features: [
      '60 scheduled posts/mo',
      '8 threads',
      'Analytics included',
      'Partial AI automation',
      'Full content library access'
    ],
    limits: {
      scheduledPosts: 60,
      threads: 8,
      analytics: true,
      automation: true,
      contentLibrary: true,
      aiGeneration: true
    }
  },
  scale: {
    id: 'scale',
    name: 'Set It & Forget It',
    price: 99,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'scale',
    buttonText: 'Choose Tier 3',
    features: [
      '150 scheduled posts/mo',
      '15 threads',
      'Full AI automation + all features',
      'Full analytics',
      'Team access',
      'Content library (save, remix, and auto-fill winning posts)',
      'Priority support'
    ],
    limits: {
      scheduledPosts: 150,
      threads: 15,
      analytics: true,
      automation: true,
      contentLibrary: true,
      aiGeneration: true,
      teamAccess: true,
      prioritySupport: true
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
  scheduledPosts: {
    name: 'Scheduled Posts',
    description: 'Schedule posts for future publishing',
    limits: {
      launch: 30,
      grow: 60,
      scale: 150
    }
  },
  threads: {
    name: 'Threads',
    description: 'Create multi-tweet thread content',
    limits: {
      launch: 4,
      grow: 8,
      scale: 15
    }
  }
};

// Binary features
export const BINARY_FEATURES = {
  analytics: {
    name: 'Analytics',
    description: 'Track post performance and engagement',
    enabled: { launch: true, grow: true, scale: true }
  },
  automation: {
    name: 'AI Automation',
    description: 'Automated content generation and optimization',
    enabled: { launch: false, grow: true, scale: true }
  },
  contentLibrary: {
    name: 'Content Library',
    description: 'Save, remix, and auto-fill winning posts',
    enabled: { launch: true, grow: true, scale: true }
  },
  aiGeneration: {
    name: 'AI Generation',
    description: 'AI-powered content creation',
    enabled: { launch: false, grow: true, scale: true }
  },
  teamAccess: {
    name: 'Team Access',
    description: 'Collaborate with team members',
    enabled: { launch: false, grow: false, scale: true }
  },
  prioritySupport: {
    name: 'Priority Support',
    description: 'Priority customer support',
    enabled: { launch: false, grow: false, scale: true }
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
  - `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GIPHY_API_KEY`, `PEXELS_API_KEY`, `DATABASE_URL`, `SITE_URL`, `STRIPE_SECRET_KEY`, `GEMINI_KEY`, `OPENAI_API_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# AI
OPENAI_API_KEY=sk-...
GEMINI_KEY=...

# AWS (serverless webhooks & scheduler)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Social Media
NEXT_PUBLIC_GIPHY_API_KEY=...
PEXELS_API_KEY=...
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