"use client";

import {
  FaBriefcase,
  FaBook,
  FaRunning,
  FaPen,
  FaChalkboardTeacher,
  FaPrayingHands,
} from "react-icons/fa";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import DialogDetails from "./dialogs/DetailsDialog";
import { AddTaskDialog } from "./dialogs/AddTaskDialog";
import DialogDeleteAll from "./dialogs/DialogDeleteAll";
import DialogDeleteTask from "./dialogs/DialogDeleteTask";
import { EditTaskDialog } from "./dialogs/EditTaskDialog";
import { Ellipsis, Plus, SquareCheck, Trash, Undo } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  category: string | null;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleDone = async (id: string, currentDone: boolean) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !currentDone } : task
    );
    setTasks(updatedTasks);

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !currentDone }),
      });
      toast.success(`Task marked as ${!currentDone ? "done" : "not done"}.`);
    } catch {
      toast.error("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted successfully.");
    } catch {
      toast.error("Failed to delete task.");
    } finally {
      setShowDeleteDialog(false);
      setSelectedTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskDialog(true);
  };

  const handleDeleteAllTasks = async () => {
    const today = new Date().toISOString().split("T")[0];

    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });

      setTasks(tasks.filter((task) => !task.createdAt.startsWith(today)));
      toast.success("All today's tasks deleted successfully.");
    } catch {
      toast.error("Failed to delete today's tasks.");
    } finally {
      setShowDeleteAllDialog(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center gap-x-3 mb-5">
        <Button
          className="flex items-center gap-x-2"
          onClick={() => setShowAddTaskDialog(true)}
        >
          Add Task <Plus className="size-5" />
        </Button>
        <Button
          onClick={() => setShowDeleteAllDialog(true)}
          className="flex items-center gap-x-2 px-6 bg-destructive hover:bg-destructive/90 transition-all duration-200"
          disabled={tasks.length === 0}
        >
          Delete All Today Tasks <Trash className="size-5" />
        </Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-md bg-muted" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">
          {`You do not have any tasks, Start by adding a task!`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`relative flex justify-between rounded-md items-center p-5 border transition-all duration-300 ${
                task.done ? "bg-emerald-100" : "bg-secondary"
              }`}
            >
              <button
                onClick={() => setSelectedTask(task)}
                className="absolute right-2 top-2 p-2 rounded-md border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-300"
              >
                <Ellipsis />
              </button>
              <div className="flex flex-col gap-y-2">
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-32 lg:max-w-36 xl:max-w-48 my-1">
                  {task.description}
                </p>
                <div className="flex items-center gap-x-2 text-base text-muted-foreground my-1">
                  {task.category === "worship" && (
                    <FaPrayingHands className="size-4" />
                  )}
                  {task.category === "work" && (
                    <FaBriefcase className="size-4" />
                  )}
                  {task.category === "read" && <FaBook className="size-4" />}
                  {task.category === "sport" && (
                    <FaRunning className="size-4" />
                  )}
                  {task.category === "personal" && <FaPen className="size-4" />}
                  {task.category === "learn" && (
                    <FaChalkboardTeacher className="size-4" />
                  )}
                  <span>{task.category}</span>
                </div>
                <div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDone(task.id, task.done);
                    }}
                    className={`rounded-sm ${
                      task.done
                        ? "bg-orange-400 hover:bg-orange-400/90"
                        : "bg-emerald-500 hover:bg-emerald-500/90"
                    }`}
                  >
                    {task.done ? (
                      <span className="flex items-center gap-x-2">
                        Mark as Not Done <Undo />
                      </span>
                    ) : (
                      <span className="flex items-center gap-x-2">
                        Mark as Done <SquareCheck />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddTaskDialog
        refreshTasks={fetchTasks}
        showAddTaskDialog={showAddTaskDialog}
        setShowAddTaskDialog={setShowAddTaskDialog}
      />
      <EditTaskDialog
        selectedTask={selectedTask}
        showEditTaskDialog={showEditTaskDialog}
        setShowEditTaskDialog={setShowEditTaskDialog}
        fetchTasks={fetchTasks}
      />
      <DialogDetails
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDeleteTask={handleDeleteTask}
        handleEditTask={handleEditTask}
        showDeleteDialog={false}
      />
      <DialogDeleteTask
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        selectedTask={selectedTask}
        handleDeleteTask={handleDeleteTask}
      />
      <DialogDeleteAll
        showDeleteAllDialog={showDeleteAllDialog}
        setShowDeleteAllDialog={setShowDeleteAllDialog}
        handleDeleteAllTasks={handleDeleteAllTasks}
      />
    </div>
  );
};

export default TaskList;
