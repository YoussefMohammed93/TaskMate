import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
    dueDate: v.string(),
    status: v.string(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
      subtasks: args.subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        completed: false,
      })),
    });

    return taskId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return tasks;
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
    dueDate: v.string(),
    status: v.string(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      priority: args.priority,
      category: args.category,
      dueDate: args.dueDate,
      status: args.status,
      tags: args.tags,
      subtasks: args.subtasks,
      recurrence: args.recurrence,
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.taskId);
  },
});

export const updateSubtaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskId: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.taskId, {
      subtasks: task.subtasks.map((st) =>
        st.id === Number(args.subtaskId)
          ? { ...st, completed: args.completed }
          : st
      ),
    });
  },
});

export const updateSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id.toString() === args.subtaskId
        ? { ...subtask, title: args.title }
        : subtask
    );

    await ctx.db.patch(args.taskId, { subtasks: updatedSubtasks });
  },
});

export const deleteSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const updatedSubtasks = task.subtasks.filter(
      (subtask) => subtask.id.toString() !== args.subtaskId
    );

    await ctx.db.patch(args.taskId, { subtasks: updatedSubtasks });
  },
});
