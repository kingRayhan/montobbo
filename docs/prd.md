# LiveComments - Product Requirements Document

## Executive Summary

LiveComments is a modern, embeddable comment system designed to replace legacy solutions like Disqus. Built with Next.js 15, React 19, and Convex for real-time functionality, it provides website owners with a secure, performant, and fully customizable commenting platform.

### Vision Statement
To become the leading embeddable comment system that prioritizes user privacy, developer experience, and real-time engagement while maintaining the simplicity that made Disqus popular.

### Key Value Propositions
- **Privacy-First**: GDPR compliant with optional cookie-free operation
- **Real-Time**: Instant comment updates without page refreshes
- **Developer-Friendly**: Simple integration with comprehensive APIs
- **Performant**: Sub-100ms load times with global CDN
- **Secure**: Built-in spam detection and domain validation
- **Customizable**: Full theming control and white-label options

## Product Overview

### Current Status
- **Version**: 0.1.0 (MVP)
- **Stage**: Development
- **Target Launch**: Q2 2024
- **Architecture**: Serverless with edge deployment

### Target Users

#### Primary Users
1. **Blog Owners** (60% of market)
   - Personal blogs and publications
   - Need: Simple, reliable commenting
   - Pain Points: Disqus ads, slow loading, privacy concerns

2. **Small Business Websites** (25% of market)
   - E-commerce product reviews
   - Service provider testimonials
   - Need: Trust-building social proof

3. **Content Creators** (15% of market)
   - YouTubers, podcasters, newsletter writers
   - Need: Cross-platform engagement tools
   - Pain Points: Fragmented audience engagement

#### Secondary Users
- **Developers**: Need headless comment APIs
- **Agencies**: Require white-label solutions
- **Enterprise**: Custom deployment and SSO

### Competitive Analysis

| Feature | LiveComments | Disqus | Commento | Hyvor Talk |
|---------|--------------|--------|----------|------------|
| **Privacy** | ✅ GDPR | ❌ Ads/Tracking | ✅ Privacy-First | ✅ Privacy-First |
| **Real-time** | ✅ Instant | ❌ Slow | ❌ Page Refresh | ✅ Real-time |
| **Performance** | ✅ <100ms | ❌ 2-3s | ✅ Fast | ✅ Fast |
| **Customization** | ✅ Full Control | ❌ Limited | ✅ Good | ✅ Good |
| **Pricing** | ✅ Freemium | ❌ Ads Required | ✅ One-time | ❌ Expensive |
| **Developer API** | ✅ Modern REST | ❌ Legacy | ❌ Basic | ✅ Good |

### Key Differentiators
1. **Real-time by default** - Comments appear instantly across all sessions
2. **Modern tech stack** - Built with latest React/Next.js for performance
3. **Iframe security** - Complete CSS/JS isolation from host site
4. **Domain validation** - Prevents unauthorized usage
5. **Developer-first APIs** - GraphQL and REST endpoints

## Technical Architecture

### Current Implementation

#### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **Components**: Shadcn/ui design system

#### Backend Stack
- **Database**: Convex (real-time serverless)
- **Authentication**: Next-auth (planned)
- **File Storage**: Convex file storage
- **CDN**: Vercel Edge Network

#### Security Model
```typescript
// Domain validation flow
1. User embeds script with appKey
2. Script passes origin domain to widget
3. Widget validates domain against app.allowedDomains
4. If invalid, show error message
5. If valid, render comment system
```

### Database Schema

#### Current Tables
```typescript
// apps table - stores registered websites
apps: {
  appKey: string,           // Public API key
  allowedDomains: string[], // Whitelisted domains
  appName: string,          // Display name
  _id: string,             // Internal ID
  _creationTime: number    // Convex timestamp
}

// comments table - stores all comments
comments: {
  ownerIdentifier: string,  // Page/post identifier
  body: string,            // Comment content
  user: {                  // User information
    name: string,
    email?: string,
    identifier?: string
  },
  parent?: string,         // For nested replies (planned)
  app: string,            // Reference to apps._id
  _id: string,            // Internal ID
  _creationTime: number   // Convex timestamp
}
```

#### Planned Schema Extensions
```typescript
// Enhanced user system
users: {
  email: string,
  name: string,
  avatar?: string,
  role: "admin" | "moderator" | "user",
  isBanned: boolean,
  reputation: number
}

// Moderation system
moderationQueue: {
  commentId: string,
  reason: string,
  status: "pending" | "approved" | "rejected",
  moderatorId?: string
}

// Voting system
votes: {
  userId: string,
  commentId: string,
  type: "up" | "down"
}
```

### API Endpoints

#### Current Implementation
```typescript
// Convex queries and mutations
api.application.getApp(appKey: string)
api.comments.getComments(appId: string, ownerIdentifier: string)
api.comments.createComment(appKey, ownerIdentifier, body, user)
```

#### Planned REST API
```
GET  /api/v1/apps/{appKey}/comments?url={pageUrl}
POST /api/v1/apps/{appKey}/comments
PUT  /api/v1/comments/{commentId}
DELETE /api/v1/comments/{commentId}
```

### Embedding System

#### Current Implementation
The embedding system uses a two-stage approach:

1. **Embed Script** (`/public/embed.js`):
   - Lightweight loader (3KB)
   - Creates iframe for security
   - Handles resize events
   - Domain validation

2. **Widget App** (`/widget` route):
   - Full React application in iframe
   - Isolated from host site
   - Real-time comment updates
   - Form validation and submission

#### Integration Examples
```html
<!-- Basic Integration -->
<div id="comments"></div>
<script>
  window.livecommentsConfig = {
    dom: "#comments",
    ownerIdentifier: "post-123",
    appKey: "your-app-key"
  };
</script>
<script src="https://livecomments.com/embed.js" async></script>
```

```jsx
// React Integration (planned)
import { LiveComments } from '@livecomments/react';

function BlogPost({ slug }) {
  return (
    <>
      <article>...</article>
      <LiveComments pageId={slug} />
    </>
  );
}
```

## Feature Specifications

### Phase 1: Core Features (Completed)

#### 1.1 Basic Comment System ✅
- **User Story**: As a visitor, I want to post comments on blog articles
- **Acceptance Criteria**:
  - Name and comment body required
  - Email field optional
  - Form validation with error messages
  - Character limits (10-2000 characters)
  - XSS protection and sanitization

#### 1.2 Domain Security ✅
- **User Story**: As a website owner, I want to control where my comments appear
- **Acceptance Criteria**:
  - App key system for API access
  - Domain whitelist validation
  - Origin header verification
  - Error messages for unauthorized domains

#### 1.3 Real-time Updates ✅
- **User Story**: As a reader, I want to see new comments without refreshing
- **Acceptance Criteria**:
  - Comments appear instantly across all sessions
  - Live comment count updates
  - Optimistic UI updates
  - Connection status indicators

#### 1.4 Responsive Design ✅
- **User Story**: As a mobile user, I want the comment system to work on my device
- **Acceptance Criteria**:
  - Mobile-first responsive design
  - Touch-friendly interface
  - Accessible form controls
  - Proper font scaling

### Phase 2: Enhanced Features (In Progress)

#### 2.1 Nested Comments (Planned)
- **User Story**: As a user, I want to reply to specific comments
- **Implementation**:
  ```typescript
  interface Comment {
    id: string;
    body: string;
    parentId?: string; // null for top-level
    children: Comment[];
    depth: number; // 0-3 levels max
  }
  ```
- **Acceptance Criteria**:
  - Reply buttons on each comment
  - Visual nesting with indentation
  - Maximum 3 levels deep
  - Collapse/expand threads

#### 2.2 User Authentication (Planned)
- **User Story**: As a regular commenter, I want to have a persistent identity
- **Implementation Options**:
  1. **Social Login**: Google, GitHub, Twitter OAuth
  2. **Email Magic Links**: Passwordless authentication
  3. **Guest Mode**: Current anonymous commenting
- **Acceptance Criteria**:
  - User profiles with avatars
  - Comment history
  - Edit/delete own comments
  - Reputation system

#### 2.3 Moderation Tools (Planned)
- **User Story**: As a website owner, I want to moderate comments
- **Features**:
  - Auto-moderation with spam detection
  - Manual approval queue
  - Bulk moderation actions
  - User banning system
- **Admin Dashboard**:
  - Real-time moderation feed
  - User management
  - Analytics and reporting

#### 2.4 Voting System (Planned)
- **User Story**: As a reader, I want to upvote helpful comments
- **Implementation**:
  ```typescript
  interface CommentWithVotes extends Comment {
    upvotes: number;
    downvotes: number;
    netVotes: number;
    userVote?: 'up' | 'down' | null;
  }
  ```

### Phase 3: Advanced Features (Future)

#### 3.1 Rich Text Editor
- Markdown support
- Image uploads
- Link previews
- Code syntax highlighting
- Emoji reactions

#### 3.2 Analytics Dashboard
- Comment engagement metrics
- User behavior analysis
- Popular content identification
- Spam detection reports

#### 3.3 API Integrations
- Webhook notifications
- Slack/Discord alerts
- Email notifications
- Export/import tools

#### 3.4 Enterprise Features
- Single Sign-On (SSO)
- White-label branding
- Custom domains
- Advanced analytics
- Priority support

## User Experience Design

### Design System
- **Base**: Tailwind CSS 4 with CSS-in-JS
- **Components**: Shadcn/ui for consistency
- **Icons**: Lucide React
- **Typography**: System fonts (-apple-system, etc.)

### Theme Customization
```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  spacing: {
    compact: boolean;
    borderRadius: string;
  };
}
```

### Accessibility Standards
- **WCAG 2.1 AA Compliance**
- Keyboard navigation support
- Screen reader compatibility  
- High contrast mode
- Focus indicators
- Semantic HTML structure

### Mobile Experience
- **Touch Targets**: Minimum 44px tap areas
- **Responsive Breakpoints**: 
  - Mobile: 320px+
  - Tablet: 768px+
  - Desktop: 1024px+
- **Progressive Enhancement**: Works without JavaScript
- **Offline Support**: Show cached comments when offline

## Performance Requirements

### Loading Performance
- **Initial Load**: <100ms TTFB
- **Bundle Size**: <50KB gzipped
- **Render Time**: <200ms to first comment
- **Core Web Vitals**:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

### Runtime Performance  
- **Real-time Updates**: <50ms latency
- **Form Submission**: <500ms response
- **Infinite Scroll**: 60fps smooth scrolling
- **Memory Usage**: <10MB for 1000 comments

### Scalability Targets
- **Concurrent Users**: 10,000+ per page
- **Comments Volume**: 1M+ comments per site
- **API Rate Limits**: 1000 req/min per IP
- **Database Performance**: <100ms query time

### Monitoring & Alerting
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Core Web Vitals
- **Uptime Monitoring**: 99.9% availability
- **Real User Monitoring**: Actual user metrics

## Security & Privacy

### Data Protection
- **GDPR Compliance**: EU data protection
- **Data Minimization**: Collect only necessary data
- **Right to Deletion**: Complete data removal
- **Data Export**: User data portability
- **Cookie-Free Mode**: Optional no-tracking mode

### Security Measures
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Token validation
- **Rate Limiting**: Abuse prevention
- **Domain Validation**: Unauthorized usage prevention
- **Content Security Policy**: Iframe protection

### Moderation & Spam Prevention
- **Automatic Spam Detection**: ML-based filtering
- **Manual Moderation**: Admin approval workflow
- **Community Moderation**: User reporting system
- **Content Filtering**: Profanity and harmful content

## Integration & APIs

### Embedding Options

#### 1. JavaScript Widget (Primary)
```html
<div id="comments"></div>
<script src="https://livecomments.com/embed.js" async></script>
<script>
  window.livecommentsConfig = {
    dom: "#comments",
    ownerIdentifier: "unique-page-id",
    appKey: "your-app-key",
    theme: "light",
    maxDepth: 3
  };
</script>
```

#### 2. React Component (Planned)
```jsx
import { LiveComments } from '@livecomments/react';

<LiveComments 
  pageId="blog-post-1"
  theme="auto"
  onCommentPost={(comment) => console.log(comment)}
/>
```

#### 3. REST API (Planned)
```bash
# Get comments
GET https://api.livecomments.com/v1/comments?page_id=blog-1

# Post comment  
POST https://api.livecomments.com/v1/comments
{
  "page_id": "blog-1",
  "body": "Great article!",
  "author": { "name": "John", "email": "john@example.com" }
}
```

### Webhooks (Planned)
```javascript
// Comment events
{
  "event": "comment.created",
  "data": {
    "comment_id": "abc123",
    "page_id": "blog-1", 
    "body": "New comment text",
    "author": { "name": "Jane" },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Platform Integrations

#### WordPress Plugin (Planned)
- Automatic installation
- Theme compatibility  
- User synchronization
- SEO-friendly output

#### Ghost CMS (Planned)  
- Theme integration
- Member system sync
- Newsletter integration

#### Static Site Generators
- Hugo shortcodes
- Jekyll includes
- Next.js components
- Gatsby plugins

## Pricing & Business Model

### Freemium Model

#### Free Tier
- **Comments**: 1,000/month
- **Websites**: 1 domain
- **Features**: Basic commenting, moderation
- **Support**: Community forum
- **Branding**: "Powered by LiveComments"

#### Pro Tier ($19/month)
- **Comments**: 50,000/month
- **Websites**: 10 domains
- **Features**: Advanced moderation, analytics
- **Support**: Email support
- **Branding**: Remove branding option
- **Customization**: Custom themes

#### Business Tier ($49/month)
- **Comments**: 250,000/month
- **Websites**: Unlimited domains
- **Features**: Full feature set
- **Support**: Priority support
- **Branding**: White-label
- **Integrations**: API access, webhooks

#### Enterprise (Custom)
- **Comments**: Unlimited
- **Features**: Custom deployment, SSO
- **Support**: Dedicated account manager
- **SLA**: 99.99% uptime guarantee
- **Compliance**: SOC2, HIPAA available

### Revenue Projections
- **Year 1**: $50k ARR (500 paying customers)
- **Year 2**: $250k ARR (2,000 paying customers)  
- **Year 3**: $750k ARR (5,000 paying customers)

### Customer Acquisition Strategy
1. **Content Marketing**: Developer blog, tutorials
2. **SEO**: Target "Disqus alternative" keywords
3. **Developer Relations**: Open source contributions
4. **Partner Program**: Referral commissions
5. **Direct Sales**: Enterprise outreach

## Development Roadmap

### Phase 1: MVP (Completed ✅)
- [x] Basic comment system
- [x] Domain validation  
- [x] Real-time updates
- [x] Responsive design
- [x] Embedding system

### Phase 2: Core Features (Current - Q1 2024)
- [ ] User authentication
- [ ] Nested comments/replies
- [ ] Basic moderation tools
- [ ] Admin dashboard
- [ ] Email notifications

### Phase 3: Advanced Features (Q2 2024)
- [ ] Voting system
- [ ] Rich text editor
- [ ] File uploads
- [ ] Spam detection
- [ ] Analytics dashboard

### Phase 4: Integrations (Q3 2024)
- [ ] WordPress plugin
- [ ] REST API v1
- [ ] Webhook system  
- [ ] React component library
- [ ] Migration tools

### Phase 5: Scale & Polish (Q4 2024)
- [ ] Performance optimization
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app for moderation

### Technical Debt & Improvements
- [ ] Migrate to TypeScript strict mode
- [ ] Add comprehensive test coverage
- [ ] Implement proper error boundaries
- [ ] Add performance monitoring
- [ ] Optimize bundle splitting

## Success Metrics

### Product Metrics
- **Monthly Active Sites**: Target 10,000 by end of year
- **Comments Created**: Target 1M comments/month
- **Real-time Latency**: <50ms average
- **Uptime**: 99.9% monthly average
- **Page Load Impact**: <100ms additional load time

### Business Metrics  
- **Customer Acquisition**: 500 new customers/month
- **Monthly Recurring Revenue**: $50k by EOY
- **Customer Churn**: <5% monthly churn rate
- **Net Promoter Score**: >70 NPS rating
- **Customer Support**: <2 hour response time

### User Experience Metrics
- **Comment Conversion Rate**: >15% of visitors comment  
- **Session Duration**: +30% increase on pages with comments
- **Mobile Usage**: >50% of traffic from mobile
- **Accessibility Score**: 100% Lighthouse accessibility
- **User Satisfaction**: >4.5/5 customer rating

## Risk Assessment & Mitigation

### Technical Risks

#### High Risk: Scaling Database Performance
- **Risk**: Convex limitations with high-volume sites
- **Mitigation**: Database sharding, read replicas, caching layer
- **Timeline**: Address in Phase 4

#### Medium Risk: Real-time Connection Stability  
- **Risk**: WebSocket connections dropping
- **Mitigation**: Auto-reconnection, fallback to polling
- **Timeline**: Monitor and improve continuously

#### Low Risk: Third-party Dependencies
- **Risk**: Breaking changes in frameworks
- **Mitigation**: Pin versions, gradual upgrades
- **Timeline**: Quarterly dependency updates

### Business Risks

#### High Risk: Competition from Established Players
- **Risk**: Disqus or new entrants matching features
- **Mitigation**: Focus on privacy and performance advantages
- **Timeline**: Continuous competitive analysis

#### Medium Risk: GDPR/Privacy Regulation Changes
- **Risk**: New privacy laws affecting business model
- **Mitigation**: Privacy-first design, legal compliance review
- **Timeline**: Quarterly legal review

#### Low Risk: Hosting/Infrastructure Costs
- **Risk**: Unexpected scaling costs
- **Mitigation**: Usage monitoring, pricing model adjustments
- **Timeline**: Monthly cost review

## Conclusion

LiveComments represents a significant opportunity to modernize the commenting ecosystem with privacy-first, performance-optimized technology. The MVP demonstrates core functionality, and the roadmap addresses key market needs while maintaining technical feasibility.

The combination of modern technology stack, developer-friendly APIs, and freemium business model positions LiveComments to capture market share from legacy solutions while providing genuine value to website owners and their audiences.

Success depends on consistent execution of the development roadmap, effective customer acquisition, and maintaining the core value propositions of privacy, performance, and ease of use.

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: March 2024  
**Owner**: Product Team  
**Stakeholders**: Engineering, Design, Business Development