import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apps: defineTable({
    appKey: v.string(),
    allowedDomains: v.array(v.string()),
    appName: v.string(),
  }),
  comments: defineTable({
    ownerIdentifier: v.string(),
    body: v.string(),
    user: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      identifier: v.optional(v.string()),
    }),
    parent: v.optional(v.id("comments")),
    app: v.id("apps"),
  }),
});
