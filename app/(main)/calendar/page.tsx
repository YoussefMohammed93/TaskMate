"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  MapPin,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Id } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { format, addHours, addMinutes, isSameDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  endDate: Date;
  startDate: Date;
  color?: string;
  isAllDay: boolean;
  location?: string;
  description: string;
  category: "task" | "event" | "meeting";
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

interface FilterOptions {
  categories: {
    task: boolean;
    event: boolean;
    meeting: boolean;
  };
  showCompleted: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface CalendarItem {
  id: Id<"calendarEvents">;
  date: Date;
  time: string;
  title: string;
  endDate?: Date;
  location?: string;
  isAllDay: boolean;
  completed: boolean;
  description: string;
  type: "task" | "event" | "meeting";
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

const categoryColors = {
  task: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    solid: "bg-blue-500",
    hover: "hover:text-blue-500",
  },
  event: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    solid: "bg-green-500",
    hover: "hover:text-green-500",
  },
  meeting: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    solid: "bg-red-500",
    hover: "hover:text-red-500",
  },
} as const;

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isInPast = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

const isValidDateTime = (dateTime: Date) => {
  const now = new Date();
  return dateTime > now;
};

const getCurrentTimeString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  return format(now, "HH:mm");
};

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [mounted, setMounted] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    id: "",
    title: "",
    description: "",
    startDate: new Date(),
    endDate: addHours(new Date(), 1),
    category: "event",
    isAllDay: false,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarItem | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: {
      task: true,
      event: true,
      meeting: true,
    },
    showCompleted: true,
    dateRange: {
      start: null,
      end: null,
    },
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const createEventMutation = useMutation(api.calendar.createEvent);
  const updateEventMutation = useMutation(api.calendar.updateEvent);
  const deleteEventMutation = useMutation(api.calendar.deleteEvent);
  const toggleEventCompletionMutation = useMutation(
    api.calendar.toggleEventCompletion
  );

  const events = useQuery(api.calendar.getEvents, {
    startDate: format(date, "yyyy-MM-dd"),
    endDate: format(date, "yyyy-MM-dd"),
  });

  const isLoading = !mounted || events === undefined;

  useEffect(() => {
    const savedView = localStorage.getItem("calendarView");
    if (
      savedView &&
      (savedView === "month" || savedView === "week" || savedView === "day")
    ) {
      setView(savedView as "month" | "week" | "day");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("calendarView", view);
    }
  }, [view, mounted]);

  const handleCreateEvent = async () => {
    setIsCreating(true);
    const toastId = toast.loading(`Creating "${newEvent.title}"...`);

    try {
      await createEventMutation({
        title: newEvent.title,
        description: newEvent.description,
        startDate: format(newEvent.startDate, "yyyy-MM-dd"),
        endDate: format(newEvent.endDate, "yyyy-MM-dd"),
        time: `${format(newEvent.startDate, "h:mm aa")} - ${format(newEvent.endDate, "h:mm aa")}`,
        type: newEvent.category,
        location: newEvent.location,
        isAllDay: newEvent.isAllDay,
        recurrence: newEvent.recurrence,
      });

      toast.success("Event created successfully", {
        id: toastId,
        description: `"${newEvent.title}" has been created.`,
      });

      setIsAddEventOpen(false);
      setNewEvent({
        id: "",
        title: "",
        description: "",
        startDate: date,
        endDate: addHours(date, 1),
        category: "event",
        isAllDay: false,
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFilterChange = (
    category: keyof FilterOptions["categories"],
    checked: boolean
  ) => {
    setFilterOptions((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked,
      },
    }));
  };

  const handlePreviousPeriod = () => {
    switch (view) {
      case "month":
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
        break;
      case "week":
        setDate(new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case "day":
        setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000));
        break;
    }
  };

  const handleNextPeriod = () => {
    switch (view) {
      case "month":
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
        break;
      case "week":
        setDate(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case "day":
        setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
        break;
    }
  };

  const toggleEventCompletion = async (id: Id<"calendarEvents">) => {
    await toggleEventCompletionMutation({ id });
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete?.id) {
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting "${eventToDelete.title}"...`);

      try {
        await deleteEventMutation({ id: eventToDelete.id });
        toast.success("Event deleted successfully", {
          id: toastId,
          description: `"${eventToDelete.title}" has been deleted.`,
        });
        setEventToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete event:", error);
        toast.error("Failed to delete event", {
          id: toastId,
          description: "Please try again later.",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateEvent = async () => {
    if (eventToEdit?.id) {
      if (isInPast(new Date(eventToEdit.date))) {
        toast.error("Invalid date/time", {
          description: "Cannot update events to be in the past",
        });
        return;
      }

      setIsEditing(true);
      const toastId = toast.loading(`Updating "${eventToEdit.title}"...`);

      try {
        await updateEventMutation({
          id: eventToEdit.id,
          title: eventToEdit.title,
          description: eventToEdit.description,
          startDate: format(eventToEdit.date, "yyyy-MM-dd"),
          endDate: format(
            eventToEdit.endDate || eventToEdit.date,
            "yyyy-MM-dd"
          ),
          time: `${format(new Date(eventToEdit.date), "h:mm aa")} - ${format(
            new Date(eventToEdit.endDate || addHours(eventToEdit.date, 1)),
            "h:mm aa"
          )}`,
          type: eventToEdit.type,
          location: eventToEdit.location,
          isAllDay: eventToEdit.isAllDay,
          recurrence: eventToEdit.recurrence,
        });

        toast.success("Event updated successfully", {
          id: toastId,
          description: `"${eventToEdit.title}" has been updated.`,
        });
        setEventToEdit(null);
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Failed to update event:", error);
        toast.error("Failed to update event", {
          id: toastId,
          description: "Please try again later.",
        });
      } finally {
        setIsEditing(false);
      }
    }
  };

  const getFilteredItems = () => {
    if (!events) return [];

    return events.filter((item) => {
      if (!filterOptions.categories[item.type]) {
        return false;
      }

      if (!filterOptions.showCompleted && item.completed) {
        return false;
      }

      return true;
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div className="w-full sm:w-auto space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Calendar</h1>
          <p className="text-muted-foreground font-light">
            Manage your schedule and organize your events
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="dark:bg-muted/50"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[370px] sm:w-96 dark:bg-secondary"
              align="end"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Events</h4>
                  <p className="text-sm text-muted-foreground">
                    Select which types of events to display
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="items-top flex space-x-2">
                    <Checkbox
                      id="tasks"
                      checked={filterOptions.categories.task}
                      onCheckedChange={(checked) =>
                        handleFilterChange("task", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="tasks"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tasks
                      </label>
                    </div>
                  </div>
                  <div className="items-top flex space-x-2">
                    <Checkbox
                      id="events"
                      checked={filterOptions.categories.event}
                      onCheckedChange={(checked) =>
                        handleFilterChange("event", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="events"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Events
                      </label>
                    </div>
                  </div>
                  <div className="items-top flex space-x-2">
                    <Checkbox
                      id="meetings"
                      checked={filterOptions.categories.meeting}
                      onCheckedChange={(checked) =>
                        handleFilterChange("meeting", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="meetings"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Meetings
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="date"
                        value={
                          filterOptions.dateRange.start
                            ?.toISOString()
                            .split("T")[0] || ""
                        }
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              start: e.target.value
                                ? new Date(e.target.value)
                                : null,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        type="date"
                        value={
                          filterOptions.dateRange.end
                            ?.toISOString()
                            .split("T")[0] || ""
                        }
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              end: e.target.value
                                ? new Date(e.target.value)
                                : null,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id="show-completed"
                    checked={filterOptions.showCompleted}
                    onCheckedChange={(checked) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        showCompleted: checked as boolean,
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="show-completed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show completed events
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="dark:bg-muted/50">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    placeholder="Enter event description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value: "task" | "event" | "meeting") =>
                      setNewEvent({ ...newEvent, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="all-day">All Day</Label>
                  <Switch
                    id="all-day"
                    checked={newEvent.isAllDay}
                    onCheckedChange={(checked) =>
                      setNewEvent({ ...newEvent, isAllDay: checked })
                    }
                  />
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Start</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        min={format(new Date(), "yyyy-MM-dd")}
                        value={format(newEvent.startDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (isInPast(newDate)) {
                            toast.error("Invalid date", {
                              description: "Cannot set date in the past",
                            });
                            return;
                          }
                          setNewEvent({ ...newEvent, startDate: newDate });
                        }}
                      />
                      {!newEvent.isAllDay && (
                        <Input
                          type="time"
                          value={format(newEvent.startDate, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(newEvent.startDate);
                            newDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            );
                            setNewEvent({ ...newEvent, startDate: newDate });
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>End</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        min={format(newEvent.startDate, "yyyy-MM-dd")}
                        value={format(newEvent.endDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (isInPast(newDate)) {
                            toast.error("Invalid date", {
                              description: "Cannot set date in the past",
                            });
                            return;
                          }
                          if (newDate < newEvent.startDate) {
                            toast.error("Invalid date", {
                              description:
                                "End date cannot be before start date",
                            });
                            return;
                          }
                          setNewEvent({ ...newEvent, endDate: newDate });
                        }}
                      />
                      {!newEvent.isAllDay && (
                        <Input
                          type="time"
                          value={format(newEvent.endDate, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(newEvent.endDate);
                            newDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            );
                            setNewEvent({ ...newEvent, endDate: newDate });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Location (Optional)</Label>
                  <Input
                    placeholder="Enter location"
                    value={newEvent.location || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Recurrence</Label>
                  <Select
                    value={newEvent.recurrence || "none"}
                    onValueChange={(
                      value: "none" | "daily" | "weekly" | "monthly"
                    ) => setNewEvent({ ...newEvent, recurrence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddEventOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:pt-10">
        <Card className="col-span-1 xl:col-span-5 h-fit">
          <CardHeader className="space-y-4 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPeriod}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPeriod}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                  {view === "month" && format(date, "MMMM yyyy")}
                  {view === "week" && `Week of ${format(date, "MMM d, yyyy")}`}
                  {view === "day" && format(date, "MMMM d, yyyy")}
                </h2>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  className="dark:bg-muted/50"
                  onClick={() => setDate(new Date())}
                >
                  Today
                </Button>
                <Select
                  value={view}
                  onValueChange={(v: "month" | "week" | "day") => setView(v)}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                Tasks
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500"
              >
                Events
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                Meetings
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="w-full rounded-md border-0"
              defaultMonth={date}
              month={date}
              showOutsideDays={true}
              fixedWeeks={true}
              classNames={{
                nav: "hidden",
                nav_button: "hidden",
                nav_button_previous: "hidden",
                nav_button_next: "hidden",
                caption: "hidden",
                caption_label: "hidden",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1",
                row: "flex w-full mt-2",
                cell: "text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex-1 p-0 h-9 aria-selected:opacity-100",
                day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 rounded-lg",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-lg focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground rounded-lg",
                day_outside: "text-muted-foreground opacity-50 rounded-lg",
                day_disabled: "text-muted-foreground opacity-50 rounded-lg",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-lg",
                day_hidden: "invisible rounded-lg",
              }}
            />
          </CardContent>
        </Card>
        <Card className="col-span-1 xl:col-span-7">
          <CardHeader className="border-b">
            <div>
              <CardTitle className="text-lg md:text-xl font-semibold">
                Schedule for {format(date, "PPP")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {getFilteredItems().length > 0 ? (
                getFilteredItems().map((item) => (
                  <div
                    key={item._id}
                    className={cn(
                      "flex flex-col sm:flex-row items-start p-4 sm:p-6 hover:bg-muted/50 transition-colors relative",
                      item.completed && "opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        categoryColors[item.type].solid
                      )}
                    />
                    <div className="min-w-[150px] pr-4 mb-4 sm:mb-0">
                      <div className="text-sm font-medium">{item.time}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            categoryColors[item.type].bg,
                            categoryColors[item.type].text
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-start justify-between">
                        <h3
                          className={cn(
                            "text-base font-semibold tracking-tight",
                            item.completed && "line-through"
                          )}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-12 h-12">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() =>
                                toggleEventCompletion(item._id)
                              }
                              className="data-[state=checked]:bg-muted data-[state=checked]:text-muted-foreground"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="dark:bg-muted/50 hover:bg-transparent h-8 w-8"
                            onClick={() => {
                              setEventToEdit({
                                id: item._id,
                                date: new Date(item.startDate),
                                time: item.time,
                                title: item.title,
                                type: item.type,
                                description: item.description,
                                location: item.location,
                                completed: item.completed,
                                isAllDay: item.isAllDay,
                                endDate: item.endDate
                                  ? new Date(item.endDate)
                                  : undefined,
                                recurrence: item.recurrence,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="dark:bg-muted/50 hover:bg-transparent hover:text-destructive h-8 w-8"
                            onClick={() => {
                              setEventToDelete({
                                id: item._id,
                                date: new Date(item.startDate),
                                time: item.time,
                                title: item.title,
                                type: item.type,
                                description: item.description,
                                location: item.location,
                                completed: item.completed,
                                isAllDay: item.isAllDay,
                                endDate: item.endDate
                                  ? new Date(item.endDate)
                                  : undefined,
                                recurrence: item.recurrence,
                              });
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      {item.location && (
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No events scheduled for this day
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {eventToDelete?.title}? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEventToDelete(null);
                setIsDeleteDialogOpen(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={eventToEdit?.title || ""}
                onChange={(e) =>
                  setEventToEdit(
                    eventToEdit
                      ? { ...eventToEdit, title: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={eventToEdit?.description || ""}
                onChange={(e) =>
                  setEventToEdit(
                    eventToEdit
                      ? { ...eventToEdit, description: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={eventToEdit?.type || "event"}
                onValueChange={(value: "task" | "event" | "meeting") =>
                  setEventToEdit(
                    eventToEdit ? { ...eventToEdit, type: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="all-day">All Day</Label>
              <Switch
                id="all-day"
                checked={eventToEdit?.isAllDay || false}
                onCheckedChange={(checked) =>
                  setEventToEdit(
                    eventToEdit ? { ...eventToEdit, isAllDay: checked } : null
                  )
                }
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Start</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={format(
                      new Date(eventToEdit?.date || new Date()),
                      "yyyy-MM-dd"
                    )}
                    onChange={(e) => {
                      if (eventToEdit) {
                        const newDate = new Date(e.target.value);
                        const currentDate = new Date(eventToEdit.date);
                        newDate.setHours(currentDate.getHours());
                        newDate.setMinutes(currentDate.getMinutes());

                        if (isInPast(newDate)) {
                          toast.error("Invalid date", {
                            description: "Cannot set date in the past",
                          });
                          return;
                        }

                        setEventToEdit({
                          ...eventToEdit,
                          date: newDate,
                        });
                      }
                    }}
                  />
                  {!eventToEdit?.isAllDay && (
                    <Input
                      type="time"
                      min={
                        isToday(new Date(eventToEdit?.date || new Date()))
                          ? getCurrentTimeString()
                          : undefined
                      }
                      value={format(
                        new Date(eventToEdit?.date || new Date()),
                        "HH:mm"
                      )}
                      onChange={(e) => {
                        if (eventToEdit) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(eventToEdit.date);
                          newDate.setHours(
                            parseInt(hours),
                            parseInt(minutes),
                            0,
                            0
                          );

                          if (isToday(newDate) && !isValidDateTime(newDate)) {
                            toast.error("Invalid time", {
                              description:
                                "Cannot set time earlier than current time",
                            });
                            return;
                          }

                          if (eventToEdit.endDate) {
                            const endDate = new Date(eventToEdit.endDate);
                            if (endDate <= newDate) {
                              const newEndDate = new Date(newDate);
                              newEndDate.setHours(newDate.getHours() + 1);
                              setEventToEdit({
                                ...eventToEdit,
                                date: newDate,
                                endDate: newEndDate,
                                time: `${format(newDate, "hh:mm a")} - ${format(newEndDate, "hh:mm a")}`,
                              });
                              return;
                            }
                          }

                          setEventToEdit({
                            ...eventToEdit,
                            date: newDate,
                            time: `${format(newDate, "hh:mm a")} - ${format(
                              eventToEdit.endDate || addHours(newDate, 1),
                              "hh:mm a"
                            )}`,
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>End</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    min={format(
                      new Date(eventToEdit?.date || new Date()),
                      "yyyy-MM-dd"
                    )}
                    value={format(
                      new Date(
                        eventToEdit?.endDate ||
                          addHours(new Date(eventToEdit?.date || new Date()), 1)
                      ),
                      "yyyy-MM-dd"
                    )}
                    onChange={(e) => {
                      if (eventToEdit) {
                        const newDate = new Date(e.target.value);
                        const currentEndDate = new Date(
                          eventToEdit.endDate || addHours(eventToEdit.date, 1)
                        );
                        newDate.setHours(currentEndDate.getHours());
                        newDate.setMinutes(currentEndDate.getMinutes());

                        const startDate = new Date(eventToEdit.date);
                        if (newDate < startDate) {
                          toast.error("Invalid date", {
                            description: "End date cannot be before start date",
                          });
                          return;
                        }

                        setEventToEdit({
                          ...eventToEdit,
                          endDate: newDate,
                          time: `${format(eventToEdit.date, "hh:mm a")} - ${format(newDate, "hh:mm a")}`,
                        });
                      }
                    }}
                  />
                  {!eventToEdit?.isAllDay && (
                    <Input
                      type="time"
                      min={
                        isToday(new Date(eventToEdit?.endDate || new Date())) &&
                        isSameDay(
                          new Date(eventToEdit?.date || new Date()),
                          new Date(eventToEdit?.endDate || new Date())
                        )
                          ? format(
                              addMinutes(
                                new Date(eventToEdit?.date || new Date()),
                                30
                              ),
                              "HH:mm"
                            )
                          : undefined
                      }
                      value={format(
                        new Date(
                          eventToEdit?.endDate ||
                            addHours(
                              new Date(eventToEdit?.date || new Date()),
                              1
                            )
                        ),
                        "HH:mm"
                      )}
                      onChange={(e) => {
                        if (eventToEdit) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newEndDate = new Date(
                            eventToEdit.endDate || addHours(eventToEdit.date, 1)
                          );
                          newEndDate.setHours(
                            parseInt(hours),
                            parseInt(minutes),
                            0,
                            0
                          );

                          const startDate = new Date(eventToEdit.date);

                          if (newEndDate <= startDate) {
                            toast.error("Invalid time", {
                              description: "End time must be after start time",
                            });
                            return;
                          }

                          if (isSameDay(startDate, newEndDate)) {
                            const minEndTime = addMinutes(startDate, 30);
                            if (newEndDate < minEndTime) {
                              toast.error("Invalid time", {
                                description:
                                  "End time must be at least 30 minutes after start time",
                              });
                              return;
                            }
                          }

                          if (
                            isToday(newEndDate) &&
                            !isValidDateTime(newEndDate)
                          ) {
                            toast.error("Invalid time", {
                              description:
                                "Cannot set time earlier than current time",
                            });
                            return;
                          }

                          setEventToEdit({
                            ...eventToEdit,
                            endDate: newEndDate,
                            time: `${format(eventToEdit.date, "hh:mm a")} - ${format(newEndDate, "hh:mm a")}`,
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Location (Optional)</Label>
              <Input
                placeholder="Enter location"
                value={eventToEdit?.location || ""}
                onChange={(e) =>
                  setEventToEdit(
                    eventToEdit
                      ? { ...eventToEdit, location: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Recurrence</Label>
              <Select
                value={eventToEdit?.recurrence || "none"}
                onValueChange={(
                  value: "none" | "daily" | "weekly" | "monthly"
                ) =>
                  setEventToEdit(
                    eventToEdit ? { ...eventToEdit, recurrence: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEventToEdit(null);
                setIsEditDialogOpen(false);
              }}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEvent}
              disabled={!eventToEdit?.title || isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
