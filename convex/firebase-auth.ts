import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Authenticate user via Firebase social login
 * This handles the server-side verification of Firebase ID tokens
 */
export const authenticateFirebaseUser = mutation({
  args: {
    appKey: v.string(),
    firebaseIdToken: v.string(),     // Firebase ID token from client
    origin: v.string(),              // Domain validation
  },
  
  handler: async (ctx, args) => {
    // 1. Validate app and domain
    const app = await ctx.db
      .query("apps")
      .filter(q => q.eq(q.field("appKey"), args.appKey))
      .first();
    
    if (!app) {
      throw new Error("Invalid app key");
    }
    
    // 2. Check if social auth is enabled for this app
    if (!app.socialAuth?.enabled) {
      throw new Error("Social authentication not enabled for this app");
    }
    
    // 3. Validate domain
    const isValidDomain = app.allowedDomains.some(domain => {
      if (domain === "*") return true;
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return args.origin.endsWith(baseDomain);
      }
      return args.origin === domain;
    });
    
    if (!isValidDomain) {
      throw new Error(`Domain '${args.origin}' is not allowed for this app`);
    }
    
    // 4. Verify Firebase ID token
    const firebaseUser = await verifyFirebaseToken(args.firebaseIdToken);
    
    if (!firebaseUser) {
      throw new Error("Invalid Firebase ID token");
    }
    
    // 5. Find existing user by Firebase UID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", q =>
        q.eq("appId", app._id)
         .eq("socialAuth.firebaseUid", firebaseUser.uid)
      )
      .first();
    
    const now = Date.now();
    
    if (existingUser) {
      // 6. Update existing user's last sign-in
      await ctx.db.patch(existingUser._id, {
        socialAuth: {
          ...existingUser.socialAuth!,
          lastSignIn: now,
          idToken: args.firebaseIdToken, // Store latest token
        },
      });
      
      return {
        userId: existingUser._id,
        isNew: false,
        user: await ctx.db.get(existingUser._id)
      };
    }
    
    // 7. Create new social user
    const userId = await ctx.db.insert("users", {
      displayName: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'Anonymous',
      email: firebaseUser.email,
      avatar: firebaseUser.picture,
      authType: "social",
      socialAuth: {
        firebaseUid: firebaseUser.uid,
        provider: firebaseUser.firebase.sign_in_provider,
        providerId: firebaseUser.user_id || firebaseUser.uid,
        providerEmail: firebaseUser.email || '',
        lastSignIn: now,
        idToken: args.firebaseIdToken,
      },
      appId: app._id,
      reputation: 0,
      commentsCount: 0,
      isBanned: false,
      isActive: true,
    });
    
    const newUser = await ctx.db.get(userId);
    
    return {
      userId,
      isNew: true,
      user: newUser
    };
  },
});

/**
 * Get user by Firebase UID
 */
export const getFirebaseUser = query({
  args: {
    appKey: v.string(),
    firebaseUid: v.string(),
  },
  
  handler: async (ctx, args) => {
    // Get app
    const app = await ctx.db
      .query("apps")
      .filter(q => q.eq(q.field("appKey"), args.appKey))
      .first();
    
    if (!app) {
      return null;
    }
    
    // Find user by Firebase UID
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", q =>
        q.eq("appId", app._id)
         .eq("socialAuth.firebaseUid", args.firebaseUid)
      )
      .first();
    
    return user;
  },
});

/**
 * Link guest user to Firebase social account
 * This allows upgrading anonymous users to authenticated users
 */
export const linkGuestToFirebase = mutation({
  args: {
    appKey: v.string(),
    guestSessionId: v.string(),
    firebaseIdToken: v.string(),
    origin: v.string(),
  },
  
  handler: async (ctx, args) => {
    // 1. Verify Firebase token
    const firebaseUser = await verifyFirebaseToken(args.firebaseIdToken);
    if (!firebaseUser) {
      throw new Error("Invalid Firebase ID token");
    }
    
    // 2. Get app
    const app = await ctx.db
      .query("apps")
      .filter(q => q.eq(q.field("appKey"), args.appKey))
      .first();
    
    if (!app) {
      throw new Error("Invalid app key");
    }
    
    // 3. Find guest user by session ID
    const guestUser = await ctx.db
      .query("users")
      .filter(q =>
        q.eq(q.field("appId"), app._id) &&
        q.eq(q.field("authType"), "guest") &&
        q.eq(q.field("guestAuth.sessionId"), args.guestSessionId)
      )
      .first();
    
    if (!guestUser) {
      throw new Error("Guest user not found");
    }
    
    // 4. Check if Firebase user already exists
    const existingFirebaseUser = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", q =>
        q.eq("appId", app._id)
         .eq("socialAuth.firebaseUid", firebaseUser.uid)
      )
      .first();
    
    if (existingFirebaseUser) {
      // Merge guest user data into existing Firebase user
      await ctx.db.patch(existingFirebaseUser._id, {
        commentsCount: existingFirebaseUser.commentsCount + guestUser.commentsCount,
        reputation: existingFirebaseUser.reputation + guestUser.reputation,
      });
      
      // Transfer guest comments to Firebase user
      const guestComments = await ctx.db
        .query("comments")
        .withIndex("by_user", q => q.eq("userId", guestUser._id))
        .collect();
      
      for (const comment of guestComments) {
        await ctx.db.patch(comment._id, {
          userId: existingFirebaseUser._id,
        });
      }
      
      // Remove guest user
      await ctx.db.delete(guestUser._id);
      
      return {
        userId: existingFirebaseUser._id,
        user: await ctx.db.get(existingFirebaseUser._id),
        merged: true
      };
    }
    
    // 5. Convert guest user to Firebase user
    const now = Date.now();
    await ctx.db.patch(guestUser._id, {
      displayName: firebaseUser.name || firebaseUser.email?.split('@')[0] || guestUser.displayName,
      email: firebaseUser.email || guestUser.email,
      avatar: firebaseUser.picture || guestUser.avatar,
      authType: "social",
      socialAuth: {
        firebaseUid: firebaseUser.uid,
        provider: firebaseUser.firebase.sign_in_provider,
        providerId: firebaseUser.user_id || firebaseUser.uid,
        providerEmail: firebaseUser.email || '',
        lastSignIn: now,
        idToken: args.firebaseIdToken,
      },
      guestAuth: undefined, // Remove guest auth data
    });
    
    return {
      userId: guestUser._id,
      user: await ctx.db.get(guestUser._id),
      upgraded: true
    };
  },
});

/**
 * Verify Firebase ID token
 * In production, this should use Firebase Admin SDK
 */
async function verifyFirebaseToken(idToken: string): Promise<any> {
  try {
    // TODO: Implement proper Firebase ID token verification
    // This is a placeholder - in production you would:
    // 1. Use Firebase Admin SDK to verify the token
    // 2. Check token expiration
    // 3. Validate audience and issuer
    
    // For now, decode the JWT payload (NOT SECURE - for development only)
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    
    // Basic validation
    if (!payload.uid || !payload.email) {
      return null;
    }
    
    // Mock Firebase user object
    return {
      uid: payload.sub || payload.user_id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      user_id: payload.sub,
      firebase: {
        sign_in_provider: payload.firebase?.sign_in_provider || 'google.com'
      }
    };
    
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Get Firebase config for app
 */
export const getFirebaseConfig = query({
  args: {
    appKey: v.string(),
  },
  
  handler: async (ctx, args) => {
    const app = await ctx.db
      .query("apps")
      .filter(q => q.eq(q.field("appKey"), args.appKey))
      .first();
    
    if (!app || !app.socialAuth?.enabled) {
      return null;
    }
    
    return {
      enabled: app.socialAuth.enabled,
      providers: app.socialAuth.providers,
      firebaseConfig: app.socialAuth.firebaseConfig,
    };
  },
});