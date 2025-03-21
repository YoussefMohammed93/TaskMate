export interface Tag {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  color: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt?: Date;
  length: number;
}

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "length-asc"
  | "length-desc"
  | "updated-desc";

export type CreateNoteInput = Omit<
  Note,
  "id" | "createdAt" | "updatedAt" | "length"
>;
export type UpdateNoteInput = Partial<
  Omit<Note, "id" | "createdAt" | "updatedAt">
>;
