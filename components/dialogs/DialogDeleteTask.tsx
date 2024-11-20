import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import React from "react";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  category: string | null;
}

interface DialogDeleteTaskProps {
  showDeleteDialog: boolean;
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTask: Task | null;
  handleDeleteTask: (id: string) => void;
}

const DialogDeleteTask = ({
  showDeleteDialog,
  setShowDeleteDialog,
  selectedTask,
  handleDeleteTask,
}: DialogDeleteTaskProps) => {
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Are you sure you want to delete this task?`}</DialogTitle>
          <DialogDescription>
            This task will be permanently deleted!
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-x-4 mt-3">
          <Button
            onClick={() => {
              if (selectedTask) {
                handleDeleteTask(selectedTask.id);
                setShowDeleteDialog(false);
              }
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Confirm
            <Trash className="size-4" />
          </Button>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDeleteTask;
