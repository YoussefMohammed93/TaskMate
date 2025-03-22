import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditSubtaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subtaskTitle: string;
  onSave: (newTitle: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditSubtaskDialog({
  isOpen,
  onOpenChange,
  subtaskTitle,
  onSave,
  isLoading = false,
}: EditSubtaskDialogProps) {
  const [title, setTitle] = useState(subtaskTitle);

  const handleSave = async () => {
    if (!title.trim()) return;

    const toastId = toast.loading("Updating subtask...");

    try {
      await onSave(title.trim());
      toast.success("Subtask updated successfully", {
        id: toastId,
        description: `Changed to "${title.trim()}"`,
      });
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask", {
        id: toastId,
        description: "Please try again later.",
      });
      throw error;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isLoading) {
          onOpenChange(open);
          if (open) {
            setTitle(subtaskTitle);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subtask</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subtask title"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && title.trim()) {
                handleSave();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
