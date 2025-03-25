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

  goals: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    timeframe: v.string(),
    priority: v.string(),
    status: v.string(),
    progress: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    milestones: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        completed: v.boolean(),
      })
    ),
  }).index("by_user", ["userId"]),

  pomodoroSettings: defineTable({
    userId: v.string(),
    work: v.number(),
    shortBreak: v.number(),
    longBreak: v.number(),
  }).index("by_user", ["userId"]),

  pomodoroSessions: defineTable({
    userId: v.string(),
    mode: v.string(),
    totalSeconds: v.number(),
    remainingSeconds: v.number(),
    isRunning: v.boolean(),
    startedAt: v.string(),
    lastPausedAt: v.optional(v.string()),
    completed: v.boolean(),
  }).index("by_user", ["userId"]),

  calendarEvents: defineTable({
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    time: v.string(),
    type: v.union(v.literal("task"), v.literal("event"), v.literal("meeting")),
    location: v.optional(v.string()),
    completed: v.boolean(),
    isAllDay: v.boolean(),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    recurrence: v.optional(
      v.union(
        v.literal("none"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )
    ),
  }).index("by_user", ["userId"]),
});
