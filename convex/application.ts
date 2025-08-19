import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getApp = query({
  args: {
    appKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("appKey"), args.appKey))
      .first();
  },
});
