"use client";

import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  ListChecks,
  Heart,
  TrendingUp,
  Trophy,
  BarChart,
  Calendar,
  Coffee,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import "react-circular-progressbar/dist/styles.css";
import { WeeklyFocusChart } from "./components/WeeklyFocusChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIMER_MODES = {
  work: {
    label: "Focus",
    color: "#33ca5a",
  },
  shortBreak: {
    label: "Short Break",
    color: "#f59e0b",
  },
  longBreak: {
    label: "Long Break",
    color: "#3b82f6",
  },
};

const STATIC_DATA = {
  settings: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    totalSessions: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    sound: true,
  },
  todayStats: {
    focusMinutes: 120,
    sessionsCompleted: 4,
    breaksCompleted: 5,
  },
  weeklyStats: [
    {
      date: "2024-02-12",
      focusMinutes: 145,
      sessionsCompleted: 6,
      breaksCompleted: 7,
    },
    {
      date: "2024-02-13",
      focusMinutes: 180,
      sessionsCompleted: 7,
      breaksCompleted: 8,
    },
    {
      date: "2024-02-14",
      focusMinutes: 120,
      sessionsCompleted: 5,
      breaksCompleted: 6,
    },
    {
      date: "2024-02-15",
      focusMinutes: 160,
      sessionsCompleted: 6,
      breaksCompleted: 7,
    },
    {
      date: "2024-02-16",
      focusMinutes: 200,
      sessionsCompleted: 8,
      breaksCompleted: 9,
    },
    {
      date: "2024-02-17",
      focusMinutes: 150,
      sessionsCompleted: 6,
      breaksCompleted: 7,
    },
    {
      date: "2024-02-18",
      focusMinutes: 170,
      sessionsCompleted: 7,
      breaksCompleted: 8,
    },
  ],
  dailyGoals: {
    focusMinutes: 180,
    sessions: 8,
  },
  streakDays: 12,
  currentSession: 3,
};

export default function Pomodoro() {
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(STATIC_DATA.settings.work * 60);
  const [progress, setProgress] = useState(100);
  const [settings, setSettings] = useState(STATIC_DATA.settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...settings });

  const progressGoalMinutes =
    (STATIC_DATA.todayStats.focusMinutes /
      STATIC_DATA.dailyGoals.focusMinutes) *
    100;
  const progressGoalSessions =
    (STATIC_DATA.todayStats.sessionsCompleted /
      STATIC_DATA.dailyGoals.sessions) *
    100;

  const handleModeChange = (newMode: "work" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setProgress(100);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(settings[mode] * 60);
    setProgress(100);
    setIsRunning(false);
  };

  const handleSettingsOpen = (open: boolean) => {
    setIsSettingsOpen(open);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSettingChange = (
    setting: keyof typeof settings,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setTempSettings((prev) => ({
        ...prev,
        [setting]: numValue,
      }));
    }
  };

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsSettingsOpen(false);
    setTimeLeft(tempSettings[mode] * 60);
    setProgress(100);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          setProgress((newTime / (settings[mode] * 60)) * 100);
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, settings]);

  return (
    <div className="pb-2 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Pomodoro</h1>
          <p className="text-muted-foreground mt-1 text-xl font-light">
            Stay focused and track your productivity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 py-1 px-3 border bg-primary/5 rounded-full text-xs font-medium">
            {STATIC_DATA.currentSession <= STATIC_DATA.settings.totalSessions
              ? `Session ${STATIC_DATA.currentSession}/${STATIC_DATA.settings.totalSessions}`
              : `Extra Session ${STATIC_DATA.currentSession - STATIC_DATA.settings.totalSessions}`}
          </div>
          <HoverCard>
            <HoverCardTrigger asChild className="cursor-default">
              <div className="flex items-center gap-2 py-1 px-3 border bg-primary/5 rounded-full">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">
                  {STATIC_DATA.streakDays} Day Streak
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-80 dark:bg-muted shadow-2xl"
              align="end"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Impressive Streak!</h4>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve been consistent for {STATIC_DATA.streakDays} days.
                  Keep up the great work to build lasting habits!
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-0">
            <Tabs
              defaultValue="work"
              className="w-full"
              onValueChange={(value) =>
                handleModeChange(value as "work" | "shortBreak" | "longBreak")
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                {Object.entries(TIMER_MODES).map(([key, { label }]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center justify-center"
                  >
                    <span>{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-8 py-8">
            <div className="w-60 h-60 sm:w-72 sm:h-72 relative">
              <CircularProgressbar
                value={progress}
                text={formatTime(timeLeft)}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: TIMER_MODES[mode].color,
                  textColor: TIMER_MODES[mode].color,
                  trailColor: "hsl(var(--muted) / 0.3)",
                  pathTransitionDuration: 0.5,
                })}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm text-muted-foreground mt-16">
                  {TIMER_MODES[mode].label} Time
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      variant={isRunning ? "outline" : "default"}
                      size="lg"
                      className="h-12 w-12 rounded-full p-0"
                    >
                      {isRunning ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRunning ? "Pause" : "Start"} timer</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset timer</TooltipContent>
                </Tooltip>
                <Dialog open={isSettingsOpen} onOpenChange={handleSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Timer Settings</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="workTime">Focus Time (minutes)</Label>
                        <Input
                          id="workTime"
                          type="number"
                          value={tempSettings.work}
                          onChange={(e) =>
                            handleSettingChange("work", e.target.value)
                          }
                          min={1}
                          max={60}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="shortBreakTime">
                          Short Break (minutes)
                        </Label>
                        <Input
                          id="shortBreakTime"
                          type="number"
                          value={tempSettings.shortBreak}
                          onChange={(e) =>
                            handleSettingChange("shortBreak", e.target.value)
                          }
                          min={1}
                          max={60}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="longBreakTime">
                          Long Break (minutes)
                        </Label>
                        <Input
                          id="longBreakTime"
                          type="number"
                          value={tempSettings.longBreak}
                          onChange={(e) =>
                            handleSettingChange("longBreak", e.target.value)
                          }
                          min={1}
                          max={60}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="totalSessions">
                          Sessions before long break
                        </Label>
                        <Input
                          id="totalSessions"
                          type="number"
                          value={tempSettings.totalSessions}
                          onChange={(e) =>
                            handleSettingChange("totalSessions", e.target.value)
                          }
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, sound: !prev.sound }))
                      }
                    >
                      {settings.sound ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <VolumeX className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {settings.sound ? "Disable" : "Enable"} sound
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 pb-6 lg:pb-0">
          <CardHeader className="pb-0">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="today">
                  <Calendar className="mr-2 h-4 w-4" />
                  Today&apos;s Progress
                </TabsTrigger>
                <TabsTrigger value="weekly">
                  <BarChart className="mr-2 h-4 w-4" />
                  Weekly Analysis
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="today"
                className="mt-6 transition-all duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <h3 className="text-lg font-medium">
                          Today&apos;s Progress
                        </h3>
                      </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-default"
                          >
                            <Trophy className="h-4 w-4 text-amber-500" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          className="w-80 dark:bg-muted shadow-2xl"
                          align="end"
                        >
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">
                              Current Streak
                            </h4>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <span>{STATIC_DATA.streakDays} days</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Keep going! You&apos;re building a great habit.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="flex flex-col items-center p-3 sm:p-4 bg-secondary dark:bg-muted/50 border rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500 mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Focus Time
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {STATIC_DATA.todayStats.focusMinutes}m
                        </p>
                      </div>
                      <div className="flex flex-col items-center p-3 sm:p-4 bg-secondary dark:bg-muted/50 border rounded-lg">
                        <ListChecks className="h-5 w-5 text-green-500 mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Sessions
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {STATIC_DATA.todayStats.sessionsCompleted}
                        </p>
                      </div>
                      <div className="flex flex-col items-center p-3 sm:p-4 bg-secondary dark:bg-muted/50 border rounded-lg">
                        <Coffee className="h-5 w-5 text-amber-800 mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Breaks
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {STATIC_DATA.todayStats.breaksCompleted}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <Label>Daily Focus Goal</Label>
                          </div>
                          <span className="text-sm font-medium">
                            {STATIC_DATA.todayStats.focusMinutes}/
                            {STATIC_DATA.dailyGoals.focusMinutes}m
                          </span>
                        </div>
                        <Progress value={progressGoalMinutes} className="h-2" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-green-600" />
                            <Label>Sessions Goal</Label>
                          </div>
                          <span className="text-sm font-medium">
                            {STATIC_DATA.todayStats.sessionsCompleted}/
                            {STATIC_DATA.dailyGoals.sessions}
                          </span>
                        </div>
                        <Progress
                          value={progressGoalSessions}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 md:mb-7">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-medium">Insights</h3>
                    </div>
                    <Card className="bg-primary/5 dark:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              Most Productive Time
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Morning ( 9AM - 11AM )
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 dark:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-6 w-6 text-green-600 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-medium">Focus Tip</h4>
                            <p className="text-sm text-muted-foreground">
                              Try to complete 1 more focus session today to
                              reach your goal!
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 dark:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Heart className="h-6 w-6 text-pink-600 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-medium">Did you know?</h4>
                            <p className="text-sm text-muted-foreground">
                              Taking a short walk during breaks can boost your
                              productivity by up to 20%.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="weekly"
                className="mt-6 transition-all duration-200"
              >
                <div className="space-y-6">
                  <Card className="border-none">
                    <WeeklyFocusChart weeklyStats={STATIC_DATA.weeklyStats} />
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
