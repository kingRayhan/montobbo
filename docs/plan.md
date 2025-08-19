# LiveComments - Disqus-like Comment System Plan

## Project Overview

Building a modern comment system similar to Disqus using Next.js 15, React 19, Convex for real-time backend, and Tailwind CSS for styling.

## Tech Stack Analysis

**Current Stack:**
- **Frontend**: Next.js 15 with React 19, Tailwind CSS 4
- **Backend**: Convex (real-time database and API)
- **Authentication**: Basic user system with token identifiers
- **Styling**: Tailwind CSS with PostCSS

## Core Features to Implement

### 1. Comment System Architecture

**Database Schema Enhancements:**
```typescript
// Enhanced schema for comment system
comments: defineTable({
  body: v.string(),
  author: v.id("users"),
  postId: v.string(), // URL or unique identifier for the page
  parentId: v.optional(v.id("comments")), // For threaded comments
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  isDeleted: v.boolean(),
  votes: v.number(), // Net votes (upvotes - downvotes)
  isApproved: v.boolean(), // Moderation status
  isSpam: v.boolean(),
}).index("byPost", ["postId"])
  .index("byAuthor", ["author"])
  .index("byParent", ["parentId"])

votes: defineTable({
  userId: v.id("users"),
  commentId: v.id("comments"),
  type: v.union(v.literal("up"), v.literal("down"))
}).index("byComment", ["commentId"])
  .index("byUser", ["userId"])

moderationLogs: defineTable({
  commentId: v.id("comments"),
  moderatorId: v.id("users"),
  action: v.string(),
  reason: v.optional(v.string()),
  createdAt: v.number()
})
```

### 2. Authentication & User Management

**Enhanced User System:**
- Social login integration (Google, GitHub, Twitter)
- Guest commenting with email verification
- User profiles with avatar support
- Role-based permissions (admin, moderator, user)

**Implementation:**
- Integrate with Convex Auth or Auth0/Clerk
- User profile management
- Session handling and security

### 3. Comment Features

**Core Commenting:**
- Rich text editor with markdown support
- Real-time comment posting and updates
- Threaded comments (nested up to 3 levels)
- Comment editing and deletion
- Character limits and validation

**Advanced Features:**
- Voting system (upvote/downvote)
- Comment sorting (newest, oldest, best, controversial)
- @ mentions with notifications
- Comment reactions/emojis
- File attachments (images, links)
- Spoiler tags and code blocks

### 4. Moderation System

**Automated Moderation:**
- Spam detection and filtering
- Profanity filter
- Rate limiting
- Duplicate comment detection

**Manual Moderation:**
- Admin dashboard for comment management
- Bulk moderation actions
- User banning and timeouts
- Comment approval workflow
- Moderation logs and audit trail

### 5. Real-time Features

**Live Updates:**
- Real-time comment notifications
- Live comment count updates
- Typing indicators
- Online user presence
- Push notifications for mentions

### 6. Analytics & Insights

**Comment Analytics:**
- Comment engagement metrics
- Popular posts/threads
- User activity tracking
- Moderation statistics
- Performance monitoring

### 7. Embeddable Widget

**Integration Options:**
- JavaScript embed script
- React component for Next.js apps
- REST API for custom integrations
- Webhook support for external systems

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Enhanced database schema implementation
- [ ] Basic comment CRUD operations
- [ ] User authentication system
- [ ] Simple comment display and posting

### Phase 2: Core Features (Week 3-4)
- [ ] Threaded comments system
- [ ] Voting and sorting functionality
- [ ] Real-time updates with Convex subscriptions
- [ ] Basic moderation tools

### Phase 3: Advanced Features (Week 5-6)
- [ ] Rich text editor integration
- [ ] File upload and media embedding
- [ ] Advanced moderation dashboard
- [ ] User mentions and notifications

### Phase 4: Polish & Performance (Week 7-8)
- [ ] Spam detection and filtering
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

### Phase 5: Integration & Deployment (Week 9-10)
- [ ] Embeddable widget creation
- [ ] API documentation
- [ ] Testing and QA
- [ ] Production deployment

## Technical Considerations

### Performance
- Implement virtual scrolling for large comment threads
- Lazy loading of nested comments
- Image optimization and CDN integration
- Caching strategies for frequently accessed data

### Security
- Input sanitization and XSS prevention
- Rate limiting to prevent spam
- CSRF protection
- Secure file upload handling

### Scalability
- Database indexing optimization
- Pagination for large comment sets
- Background job processing for heavy operations
- CDN for static assets

### Accessibility
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## File Structure

```
src/
├── components/
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   ├── CommentEditor.tsx
│   │   └── VotingButtons.tsx
│   ├── moderation/
│   │   ├── ModerationDashboard.tsx
│   │   └── ModerationQueue.tsx
│   └── ui/
├── lib/
│   ├── auth/
│   ├── validation/
│   └── utils/
├── app/
│   ├── comments/
│   ├── admin/
│   └── api/
└── types/
```

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Authentication
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# File Upload
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Email
EMAIL_FROM=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Analytics
ANALYTICS_ID=
```

## Success Metrics

- Real-time comment posting and updates
- Threaded comment display (3 levels deep)
- Spam detection accuracy > 95%
- Page load time < 2 seconds
- Mobile responsiveness score > 90
- Accessibility compliance (WCAG 2.1 AA)
- Support for 1000+ concurrent users

## User Integration Guide

### How Website Owners Will Use LiveComments

#### Option 1: JavaScript Widget (Universal)
```html
<!-- Add to any website -->
<div id="livecomments"></div>
<script>
  window.livecommentsConfig = {
    url: 'https://yoursite.com/current-page', // Page identifier
    siteDomain: 'yoursite.com',
    theme: 'light', // 'light' | 'dark' | 'auto'
    maxDepth: 3, // Comment nesting levels
    sortBy: 'newest' // 'newest' | 'oldest' | 'best'
  };
</script>
<script src="https://livecomments.com/embed.js" async></script>
```

#### Option 2: React Component (Next.js/React apps)
```jsx
// Install: npm install @livecomments/react
import { LiveComments } from '@livecomments/react';

function BlogPost({ slug }) {
  return (
    <article>
      <h1>My Blog Post</h1>
      <p>Content here...</p>
      
      <LiveComments 
        url={`/blog/${slug}`}
        theme="auto"
        maxDepth={3}
      />
    </article>
  );
}
```

#### Option 3: REST API (Custom implementations)
```javascript
// Get comments for a page
fetch('https://api.livecomments.com/v1/comments?url=/blog/my-post')
  .then(res => res.json())
  .then(comments => renderComments(comments));

// Post a new comment
fetch('https://api.livecomments.com/v1/comments', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    url: '/blog/my-post',
    body: 'Great article!',
    parentId: null
  })
});
```

### Setup Process for Website Owners

#### Step 1: Account Creation
1. Visit livecomments.com and sign up
2. Verify email and choose plan (Free/Pro/Enterprise)
3. Create a new site project
4. Add domain(s) to whitelist

#### Step 2: Site Configuration
```javascript
// Admin dashboard settings
{
  domain: "myblog.com",
  moderationMode: "auto", // "none" | "auto" | "manual"
  guestCommenting: true,
  socialLogin: ["google", "github", "twitter"],
  spamProtection: true,
  emailNotifications: true
}
```

#### Step 3: Customization Options
- **Theme Customization**: Colors, fonts, spacing
- **Language Settings**: 36+ supported languages
- **Moderation Rules**: Auto-filter keywords, link limits
- **User Permissions**: Who can comment, vote, moderate

#### Step 4: Integration Testing
1. Add widget to test page
2. Post test comments
3. Verify real-time updates
4. Test moderation features

### Platform-Specific Integration Guides

#### WordPress
```php
// Plugin installation
1. Download LiveComments WordPress plugin
2. Install via WordPress admin
3. Configure API keys in settings
4. Widget auto-appears on posts/pages
```

#### Ghost CMS
```javascript
// Add to post.hbs template
{{#post}}
  <div class="post-content">
    {{{content}}}
  </div>
  
  <div id="livecomments" data-url="{{url}}"></div>
  <script src="https://livecomments.com/embed.js" async></script>
{{/post}}
```

#### Shopify
```liquid
<!-- In product template -->
<div id="livecomments" 
     data-url="{{ shop.permanent_domain }}{{ product.url }}"
     data-title="{{ product.title }}">
</div>
```

#### Static Site Generators (Hugo, Jekyll, etc.)
```html
<!-- In layout template -->
<div id="livecomments" 
     data-url="{{ .Permalink }}"
     data-title="{{ .Title }}">
</div>
```

### Admin Dashboard Features

#### Comment Management
- **Live Comment Feed**: Real-time comment stream
- **Bulk Actions**: Approve/delete/spam multiple comments
- **User Management**: Ban users, view profiles
- **Analytics**: Comment trends, engagement metrics

#### Moderation Tools
- **Auto-Moderation**: Spam detection, profanity filters
- **Manual Review**: Queue for pending comments
- **Notification System**: Email/SMS alerts for new comments
- **Moderation Team**: Invite moderators with different permissions

### Pricing Tiers

#### Free Plan
- Up to 1,000 comments/month
- 1 website
- Basic moderation
- Community support

#### Pro Plan ($9/month)
- Up to 50,000 comments/month
- 5 websites
- Advanced moderation
- Email support
- Custom themes

#### Enterprise ($49/month)
- Unlimited comments
- Unlimited websites
- Priority support
- White-label option
- Advanced analytics
- SSO integration

### Migration from Other Systems

#### From Disqus
```bash
# Export Disqus comments
# Use our migration tool
npx @livecomments/migrate disqus --export-file=comments.xml
```

#### From WordPress Native
```php
// WordPress plugin handles automatic migration
// Preserves comment threading and user data
```

### Performance Impact

- **Load Time**: <100ms additional page load
- **Bundle Size**: 12KB gzipped JavaScript
- **CDN Delivery**: Global edge locations
- **Caching**: Aggressive comment caching strategies

### Privacy & Compliance

- **GDPR Compliant**: EU user data protection
- **Cookie-Free Option**: Available for privacy-focused sites  
- **Data Export**: Users can export their comment data
- **Right to Delete**: Complete data removal on request

## How to Build the JavaScript Embedding System

### Architecture Overview

The embedding system consists of 3 main parts:
1. **Embed Script** (`embed.js`) - The widget loader
2. **Widget Bundle** (`widget.js`) - The actual React comment component
3. **API Endpoints** - Backend services for comments

### Step 1: Create the Embed Script (`public/embed.js`)

```javascript
(function() {
  'use strict';
  
  // Prevent multiple loads
  if (window.LiveCommentsLoaded) return;
  window.LiveCommentsLoaded = true;

  // Default configuration
  const defaultConfig = {
    apiUrl: 'https://api.livecomments.com/v1',
    widgetUrl: 'https://widget.livecomments.com/widget.js',
    theme: 'light',
    maxDepth: 3,
    sortBy: 'newest'
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.livecommentsConfig || {});

  // Find target div
  const container = document.getElementById('livecomments');
  if (!container) {
    alert('LiveComments: Container element #livecomments not found');
    return;
  }

  // Create iframe for security isolation
  function createWidget() {
    const iframe = document.createElement('iframe');
    iframe.src = `${config.widgetUrl}?${new URLSearchParams({
      url: config.url || window.location.href,
      siteDomain: config.siteDomain || window.location.hostname,
      theme: config.theme,
      maxDepth: config.maxDepth,
      sortBy: config.sortBy
    })}`;
    
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '400px';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    
    // Handle iframe resizing
    window.addEventListener('message', function(event) {
      if (event.origin !== 'https://widget.livecomments.com') return;
      
      if (event.data.type === 'resize') {
        iframe.style.height = event.data.height + 'px';
      }
    });
    
    container.appendChild(iframe);
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
```

### Step 2: Create the Widget App (`src/widget/`)

Create a separate Next.js app for the widget:

```javascript
// src/widget/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import CommentWidget from './components/CommentWidget';

export default function WidgetPage() {
  const searchParams = useSearchParams();
  
  const config = {
    url: searchParams.get('url'),
    siteDomain: searchParams.get('siteDomain'),
    theme: searchParams.get('theme') || 'light',
    maxDepth: parseInt(searchParams.get('maxDepth') || '3'),
    sortBy: searchParams.get('sortBy') || 'newest'
  };

  // Handle iframe resizing
  useEffect(() => {
    function resizeIframe() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({
        type: 'resize',
        height: height
      }, '*');
    }

    // Initial resize
    resizeIframe();
    
    // Resize on content changes
    const observer = new ResizeObserver(resizeIframe);
    observer.observe(document.body);
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`widget-container theme-${config.theme}`}>
      <CommentWidget {...config} />
    </div>
  );
}
```

### Step 3: Build the Comment Widget Component

```javascript
// src/widget/components/CommentWidget.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface WidgetProps {
  url: string;
  siteDomain: string;
  theme: string;
  maxDepth: number;
  sortBy: string;
}

export default function CommentWidget({ url, siteDomain, theme, maxDepth, sortBy }: WidgetProps) {
  const comments = useQuery(api.comments.getByUrl, { url });

  return (
    <div className="livecomments-widget">
      <div className="comments-header">
        <h3>Comments ({comments?.length || 0})</h3>
      </div>
      
      <CommentForm url={url} />
      
      <CommentList 
        comments={comments || []}
        maxDepth={maxDepth}
        sortBy={sortBy}
      />
    </div>
  );
}
```

### Step 4: Set Up Build Process

```javascript
// next.config.js for widget
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/widget',
  assetPrefix: 'https://widget.livecomments.com',
  
  // Optimize for embedding
  experimental: {
    optimizeCss: true
  }
};

module.exports = nextConfig;
```

```json
// package.json scripts
{
  "scripts": {
    "build:embed": "cp public/embed.js dist/embed.js",
    "build:widget": "next build && next export",
    "build": "npm run build:embed && npm run build:widget"
  }
}
```

### Step 5: Deployment Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   User's Website    │    │   CDN (embed.js)     │    │   Widget Server     │
│                     │    │                      │    │                     │
│ <div id="live       │───▶│ livecomments.com/    │───▶│ widget.livecomments │
│ comments"></div>    │    │ embed.js             │    │ .com                │
│                     │    │                      │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                                                │
                                                                ▼
                                                        ┌─────────────────────┐
                                                        │   API Server        │
                                                        │                     │
                                                        │ api.livecomments    │
                                                        │ .com                │
                                                        │                     │
                                                        └─────────────────────┘
```

### Step 6: Security Considerations

```javascript
// Widget security headers
// src/widget/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Allow embedding in iframes
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  response.headers.set('Content-Security-Policy', 
    "frame-ancestors *; script-src 'self' 'unsafe-inline'"
  );
  
  return response;
}
```

### Step 7: Domain Validation

```javascript
// Convex function to validate domains
// convex/sites.ts
export const validateDomain = mutation({
  args: { 
    siteDomain: v.string(),
    url: v.string() 
  },
  handler: async (ctx, args) => {
    // Check if domain is registered
    const site = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", args.siteDomain))
      .first();
      
    if (!site) {
      throw new Error("Domain not registered");
    }
    
    // Validate URL belongs to domain
    const urlDomain = new URL(args.url).hostname;
    if (urlDomain !== args.siteDomain) {
      throw new Error("URL domain mismatch");
    }
    
    return { valid: true, siteId: site._id };
  },
});
```

### Step 8: Testing the Embed

Create a test HTML file:

```html
<!-- test.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Embed Test</title>
</head>
<body>
    <h1>My Blog Post</h1>
    <p>Some content here...</p>
    
    <div id="livecomments"></div>
    <script>
      window.livecommentsConfig = {
        url: window.location.href,
        siteDomain: 'localhost:3000',
        theme: 'light',
        maxDepth: 3,
        sortBy: 'newest'
      };
    </script>
    <script src="http://localhost:3000/embed.js" async></script>
</body>
</html>
```

### Development Workflow

1. **Main App**: `npm run dev` (port 3000) - Your comment system dashboard
2. **Widget App**: Build and serve separately (port 3001) 
3. **Test Page**: Serve test.html to verify embedding works
4. **API**: Convex handles the backend automatically

This creates a complete embedding system that works like Disqus but with your own infrastructure.

## Future Enhancements

- AI-powered content moderation
- Comment sentiment analysis
- Multi-language support
- Advanced analytics and reporting
- Integration with popular CMS platforms
- Mobile app for moderation
- Comment export/import functionality
- Advanced user reputation system