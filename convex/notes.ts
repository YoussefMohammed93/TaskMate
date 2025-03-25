import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new note
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    color: v.string(),
    isPinned: v.boolean(),
    folderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    const noteId = await ctx.db.insert("notes", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
    });

    return noteId;
  },
});

// Get all notes for the current user
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return notes;
  },
});

// Update a note
export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    folderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    const userId = identity.subject;

    const existingNote = await ctx.db.get(id);
    if (!existingNote || existingNote.userId !== userId) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});

// Delete a note
export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingNote = await ctx.db.get(id);
    if (!existingNote || existingNote.userId !== userId) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.delete(id);
    return id;
  },
});

// Toggle pin status
export const togglePin = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingNote = await ctx.db.get(id);
    if (!existingNote || existingNote.userId !== userId) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.patch(id, {
      isPinned: !existingNote.isPinned,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});
