import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's pomodoro settings
export const getSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const settings = await ctx.db
      .query("pomodoroSettings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return settings || null;
  },
});

// Save user's pomodoro settings
export const saveSettings = mutation({
  args: {
    work: v.number(),
    shortBreak: v.number(),
    longBreak: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existingSettings = await ctx.db
      .query("pomodoroSettings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, args);
      return existingSettings._id;
    } else {
      const settingsId = await ctx.db.insert("pomodoroSettings", {
        userId,
        ...args,
      });
      return settingsId;
    }
  },
});

// Get active pomodoro session
export const getActiveSession = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const runningSession = await ctx.db
      .query("pomodoroSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .filter((q) => q.eq(q.field("isRunning"), true))
      .first();

    if (runningSession) {
      return runningSession;
    }

    const recentStoppedSession = await ctx.db
      .query("pomodoroSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .filter((q) => q.eq(q.field("isRunning"), false))
      .order("desc")
      .first();

    return recentStoppedSession || null;
  },
});

// Start new pomodoro session
export const startSession = mutation({
  args: {
    mode: v.string(),
    totalSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existingSession = await ctx.db
      .query("pomodoroSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, { completed: true });
    }

    const sessionId = await ctx.db.insert("pomodoroSessions", {
      userId,
      mode: args.mode,
      totalSeconds: args.totalSeconds,
      remainingSeconds: args.totalSeconds,
      isRunning: true,
      startedAt: new Date().toISOString(),
      completed: false,
    });

    return sessionId;
  },
});

// Update session status (pause/resume)
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("pomodoroSessions"),
    isRunning: v.boolean(),
    remainingSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await ctx.db.patch(args.sessionId, {
      isRunning: args.isRunning,
      remainingSeconds: args.remainingSeconds,
      lastPausedAt: args.isRunning ? undefined : new Date().toISOString(),
    });

    return args.sessionId;
  },
});

// Complete session
export const completeSession = mutation({
  args: {
    sessionId: v.id("pomodoroSessions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await ctx.db.patch(args.sessionId, {
      completed: true,
      isRunning: false,
    });

    return args.sessionId;
  },
});
