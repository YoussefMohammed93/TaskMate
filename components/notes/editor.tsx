import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

interface EditorProps {
  editable?: boolean;
  initialContent?: string;
  onChange: (content: string) => void;
}

const Editor = ({ editable = true, onChange, initialContent }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });

    return response.url;
  };

  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    uploadFile: handleUpload,
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={() => {
        const content = JSON.stringify(editor.document, null, 2);
        onChange(content);
      }}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
};

export default Editor;
