import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    time: v.string(),
    type: v.union(v.literal("task"), v.literal("event"), v.literal("meeting")),
    location: v.optional(v.string()),
    isAllDay: v.boolean(),
    recurrence: v.optional(
      v.union(
        v.literal("none"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const eventId = await ctx.db.insert("calendarEvents", {
      ...args,
      userId,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    return eventId;
  },
});

// Get events for a given date range
export const getEvents = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const events = await ctx.db
      .query("calendarEvents")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("startDate"), args.startDate)
        )
      )
      .collect();

    return events;
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    time: v.string(),
    type: v.union(v.literal("task"), v.literal("event"), v.literal("meeting")),
    location: v.optional(v.string()),
    isAllDay: v.boolean(),
    recurrence: v.optional(
      v.union(
        v.literal("none"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const updateData = {
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      time: args.time,
      type: args.type,
      location: args.location,
      isAllDay: args.isAllDay,
      recurrence: args.recurrence,
    };
    await ctx.db.patch(args.id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Toggle event completion status
export const toggleEventCompletion = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      completed: !event.completed,
    });
  },
});
