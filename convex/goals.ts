import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createGoal = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    timeframe: v.string(),
    priority: v.string(),
    status: v.string(),
    progress: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    milestones: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        completed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    const goalId = await ctx.db.insert("goals", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
    });

    return goalId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const goals = await ctx.db
      .query("goals")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return goals;
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    timeframe: v.string(),
    priority: v.string(),
    status: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    milestones: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        completed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { goalId, ...updates } = args;

    await ctx.db.patch(goalId, updates);

    const updatedGoal = await ctx.db.get(goalId);
    return updatedGoal;
  },
});

export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.goalId);
  },
});
