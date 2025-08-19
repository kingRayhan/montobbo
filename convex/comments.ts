import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getComments = query({
  args: {
    appId: v.string(),
    ownerIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const { appId, ownerIdentifier } = args;
    return await ctx.db
      .query("comments")
      .filter(
        (q) =>
          q.eq(q.field("app"), appId) &&
          q.eq(q.field("ownerIdentifier"), ownerIdentifier)
      )
      .order("desc")
      .collect();
  },
});

export const createComment = mutation({
  args: {
    appKey: v.string(),
    ownerIdentifier: v.string(),
    body: v.string(),
    user: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      identifier: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { appKey, ownerIdentifier, body, user } = args;

    const fetchedApp = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appKey"), appKey))
      .first();

    if (!fetchedApp) {
      throw new Error("Invalid app key");
    }

    return await ctx.db.insert("comments", {
      app: fetchedApp._id,
      ownerIdentifier,
      body,
      user,
    });
  },
});
