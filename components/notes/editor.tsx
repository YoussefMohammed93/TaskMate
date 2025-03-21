"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
const lowlight = createLowlight(common);
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { common, createLowlight } from "lowlight";
import { Editor, EditorContent } from "@tiptap/react";
import { Bold, Italic, List, Heading, Code } from "lucide-react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

export function NoteEditor() {
  const [editor] = useState(
    () =>
      new Editor({
        extensions: [
          StarterKit,
          CodeBlockLowlight.configure({
            lowlight,
          }),
          Image,
          Link,
        ],
        content: "",
        editorProps: {
          attributes: {
            class:
              "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
          },
        },
      })
  );

  const toggleFormat = (
    type:
      | "toggleBold"
      | "toggleItalic"
      | "toggleBulletList"
      | "toggleHeading"
      | "toggleCodeBlock"
  ) => {
    if (type === "toggleHeading") {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    } else {
      editor?.chain().focus()[type]().run();
    }
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFormat("toggleBold")}
          className={cn(editor?.isActive("bold") && "bg-muted")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFormat("toggleItalic")}
          className={cn(editor?.isActive("italic") && "bg-muted")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFormat("toggleBulletList")}
          className={cn(editor?.isActive("bulletList") && "bg-muted")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFormat("toggleHeading")}
          className={cn(editor?.isActive("heading") && "bg-muted")}
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFormat("toggleCodeBlock")}
          className={cn(editor?.isActive("codeBlock") && "bg-muted")}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
