import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

interface DialogDeleteAllProps {
  showDeleteAllDialog: boolean;
  setShowDeleteAllDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteAllTasks: () => void;
}

const DialogDeleteAll = ({
  showDeleteAllDialog,
  setShowDeleteAllDialog,
  handleDeleteAllTasks,
}: DialogDeleteAllProps) => {
  return (
    <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Are you sure you want to delete all today's tasks?`}</DialogTitle>
          <DialogDescription>
            Today’s tasks will be permanently deleted!
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-x-4 mt-3">
          <Button
            onClick={() => {
              handleDeleteAllTasks();
              setShowDeleteAllDialog(false);
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
            <Trash className="size-4" />
          </Button>
          <Button onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDeleteAll;
