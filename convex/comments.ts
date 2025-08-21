import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get comments for a specific page with user data
 */
export const getComments = query({
  args: {
    appKey: v.string(),
    ownerIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    // Get app
    const app = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appKey"), args.appKey))
      .first();

    if (!app) {
      throw new Error("Invalid app key");
    }

    // Get comments for this page
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_page", (q) =>
        q
          .eq("appId", app._id)
          .eq("ownerIdentifier", args.ownerIdentifier)
          .eq("status", "published")
      )
      .order("desc")
      .collect();

    // Enrich comments with user data
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user
            ? {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
                avatar: user.avatar,
              }
            : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

export const createComment = mutation({
  args: {
    appKey: v.string(),
    ownerIdentifier: v.string(),
    body: v.string(),
    user: v.object({
      authType: v.union(
        v.literal("external"), // From parent website (WordPress, NextAuth, etc.)
        v.literal("social"), // OAuth (Google, GitHub, etc.) - future
        v.literal("anonymous") // Anonymous with session - future
      ),
      externalSystemIdentifier: v.string(),
      userId: v.id("users"),
      displayName: v.string(),
      email: v.string(),
      avatar: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Get app
    const app = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appKey"), args.appKey))
      .first();

    if (!app) {
      throw new Error("Invalid app key");
    }

    // Create comment
    // const comment = await ctx.db.insert("comments", {});
  },
});
