import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    clerkUserId: v.string(),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  }).index("byClerkUserId", ["clerkUserId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
    dueDate: v.string(),
    status: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    tags: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        color: v.string(),
      })
    ),
    subtasks: v.array(
      v.object({
        id: v.number(),
        title: v.string(),
        completed: v.boolean(),
      })
    ),
    recurrence: v.optional(
      v.object({
        frequency: v.string(),
        interval: v.number(),
        endDate: v.optional(v.string()),
        occurrences: v.optional(v.number()),
        daysOfWeek: v.optional(v.array(v.number())),
        dayOfMonth: v.optional(v.number()),
      })
    ),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    color: v.string(),
    isPinned: v.boolean(),
    folderId: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
