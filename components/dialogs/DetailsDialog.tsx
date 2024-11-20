import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Edit } from "lucide-react";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  category: string | null;
}

interface DialogDetailsProps {
  selectedTask: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  showDeleteDialog: boolean;
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteTask: (id: string) => void;
  handleEditTask: (task: Task) => void;
}

const DialogDetails = ({
  selectedTask,
  setSelectedTask,
  showDeleteDialog,
  setShowDeleteDialog,
  handleDeleteTask,
  handleEditTask,
}: DialogDetailsProps) => {
  return (
    <>
      <Dialog
        open={selectedTask !== null}
        onOpenChange={() => setSelectedTask(null)}
      >
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Task Details (${selectedTask?.title})`}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div>
              <p className="text-sm text-muted-foreground mb-3 truncate max-w-md">
                {selectedTask.description}
              </p>
              <div className="flex justify-end gap-x-3">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete Task
                  <Trash className="size-4" />
                </Button>
                <Button
                  onClick={() => handleEditTask(selectedTask)}
                  className="mb-2 bg-primary text-white hover:bg-primary-dark"
                >
                  Edit Task
                  <Edit className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
                  setSelectedTask(null);
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm
            </Button>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogDetails;
