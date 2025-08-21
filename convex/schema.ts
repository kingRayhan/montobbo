import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apps: defineTable({
    appKey: v.string(),
    allowedDomains: v.array(v.string()),
    appName: v.string(),
    
    // External auth configuration
    externalAuth: v.optional(v.object({
      requireToken: v.boolean(),        // Require signed tokens for validation
      tokenSecret: v.optional(v.string()), // Secret for JWT validation
      userSync: v.boolean(),            // Auto-update user data from external system
    })),
    
    // Firebase/Social auth configuration
    socialAuth: v.optional(v.object({
      enabled: v.boolean(),             // Enable social login
      providers: v.array(v.string()),   // ["google", "github", "twitter"]
      firebaseConfig: v.optional(v.object({
        projectId: v.string(),
        apiKey: v.string(),
        authDomain: v.string(),
      })),
    })),
  }),

  // Unified users table - handles all authentication types
  users: defineTable({
    // Core identity
    displayName: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),

    // Authentication source
    authType: v.union(
      v.literal("external"),    // From parent website (WordPress, NextAuth, etc.)
      v.literal("social"),      // OAuth via Firebase (Google, GitHub, etc.)
      v.literal("guest")        // Anonymous with session
    ),

    // App association
    appId: v.id("apps"),

    // External authentication data (when authType: "external")
    externalAuth: v.optional(v.object({
      systemId: v.string(),             // External user identifier (e.g., "wp-123")
      systemType: v.optional(v.string()), // "wordpress", "nextauth", "custom"
      role: v.optional(v.string()),     // Role from external system
      lastSeen: v.number(),             // Last activity timestamp
      tokenValidated: v.boolean(),      // Whether token was validated
    })),
    
    // Social authentication data (when authType: "social")
    socialAuth: v.optional(v.object({
      firebaseUid: v.string(),          // Firebase user ID
      provider: v.string(),             // "google.com", "github.com", "twitter.com"
      providerId: v.string(),           // Provider's user ID
      providerEmail: v.string(),        // Email from provider
      lastSignIn: v.number(),           // Last sign-in timestamp
      idToken: v.optional(v.string()),  // Firebase ID token (for verification)
    })),
    
    // Guest authentication data (when authType: "guest")
    guestAuth: v.optional(v.object({
      sessionId: v.string(),            // Browser session identifier
      emailVerified: v.boolean(),       // Email confirmation status
      ipAddress: v.optional(v.string()), // For moderation
    })),

    // User stats
    reputation: v.number(),
    commentsCount: v.number(),
    isBanned: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_app", ["appId"])
    .index("by_external_id", ["appId", "externalAuth.systemId"])
    .index("by_firebase_uid", ["appId", "socialAuth.firebaseUid"])
    .index("by_email", ["appId", "email"]),

  comments: defineTable({
    ownerIdentifier: v.string(),
    body: v.string(),

    // Reference to unified users table instead of embedding user data
    userId: v.id("users"),

    // Nested comments support
    parentId: v.optional(v.id("comments")),
    depth: v.number(), // 0 = top-level, 1+ = nested

    // Associations
    appId: v.id("apps"),

    // Timestamps
    createdAt: v.number(),
    editedAt: v.optional(v.number()),

    // Moderation status
    status: v.union(
      v.literal("published"),
      v.literal("pending"),
      v.literal("hidden"),
      v.literal("deleted")
    ),
  })
    .index("by_page", ["appId", "ownerIdentifier", "status"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),
});
