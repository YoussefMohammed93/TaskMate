"use client";

import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Bell,
  Coffee,
  Brain,
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
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useRef, useState, useEffect } from "react";
import "react-circular-progressbar/dist/styles.css";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import quotes from "@/data/motivational-quotes.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Heart, Trophy, Sparkles, Quote } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const QUOTE_COLORS = {
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    text: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    text: "text-purple-500",
  },
  red: {
    bg: "bg-red-500",
    bgLight: "bg-red-500/10",
    text: "text-red-500",
  },
  orange: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-500/10",
    text: "text-orange-500",
  },
  pink: {
    bg: "bg-pink-500",
    bgLight: "bg-pink-500/10",
    text: "text-pink-500",
  },
} as const;

const getIconComponent = (iconName: string) => {
  const icons = {
    Heart,
    Trophy,
    Sparkles,
  };
  return icons[iconName as keyof typeof icons] || Quote;
};

const TIMER_MODES = {
  work: {
    label: "Focus",
    color: "#33ca5a",
    icon: Brain,
    description: "Time to focus and be productive",
  },
  shortBreak: {
    label: "Short Break",
    color: "#f59e0b",
    icon: Coffee,
    description: "Take a quick breather",
  },
  longBreak: {
    label: "Long Break",
    color: "#3b82f6",
    icon: Bell,
    description: "Time for a longer rest",
  },
};

const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 10,
};

class Timer {
  private timerId: number | null = null;
  private startTime: number = 0;
  private remaining: number = 0;
  private readonly onTick: (timeLeft: number) => void;
  private readonly onComplete: () => void;

  constructor(onTick: (timeLeft: number) => void, onComplete: () => void) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start(durationInSeconds: number) {
    if (this.timerId) this.stop();

    this.remaining = durationInSeconds;
    this.startTime = Date.now();

    this.timerId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.remaining = Math.max(0, durationInSeconds - elapsed);

      this.onTick(this.remaining);

      if (this.remaining === 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  isRunning() {
    return this.timerId !== null;
  }

  getTimeLeft() {
    return this.remaining;
  }
}

function useTimer(
  savedSettings:
    | { work: number; shortBreak: number; longBreak: number }
    | undefined,
  activeSession:
    | {
        _id: string;
        mode: string;
        isRunning: boolean;
        remainingSeconds: number;
        totalSeconds: number;
      }
    | undefined
) {
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.work * 60);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef<Timer | null>(null);
  const initRef = useRef(false);

  const startSession = useMutation(api.pomodoro.startSession);
  const updateSessionStatus = useMutation(api.pomodoro.updateSessionStatus);
  const completeSession = useMutation(api.pomodoro.completeSession);

  const updateProgress = (currentTime: number) => {
    const totalTime = (savedSettings?.[mode] || DEFAULT_SETTINGS[mode]) * 60;
    const currentProgress = (currentTime / totalTime) * 100;
    setProgress(Math.max(0, Math.min(100, currentProgress))); // Ensure progress stays between 0-100
  };

  const initializeSession = () => {
    if (initRef.current) return;
    initRef.current = true;

    if (activeSession && !Array.isArray(activeSession)) {
      setMode(activeSession.mode as "work" | "shortBreak" | "longBreak");
      setTimeLeft(activeSession.remainingSeconds);
      setProgress(
        (activeSession.remainingSeconds / activeSession.totalSeconds) * 100
      );
      // Set isRunning based on the active session's state
      setIsRunning(activeSession.isRunning);

      if (!timerRef.current) {
        timerRef.current = new Timer(
          (remaining) => {
            setTimeLeft(remaining);
            updateProgress(remaining);
            updateSessionStatus({
              sessionId: activeSession._id as Id<"pomodoroSessions">,
              isRunning: true,
              remainingSeconds: remaining,
            });
          },
          async () => {
            setIsRunning(false);
            await completeSession({
              sessionId: activeSession._id as Id<"pomodoroSessions">,
            });
          }
        );

        // If the session is running, start the timer immediately
        if (activeSession.isRunning) {
          timerRef.current.start(activeSession.remainingSeconds);
        }
      }
    } else if (savedSettings && !Array.isArray(savedSettings)) {
      const duration = savedSettings[mode] * 60;
      setTimeLeft(duration);
      setProgress(100);
    }
  };

  const startTimer = async () => {
    if (!timerRef.current) {
      timerRef.current = new Timer(
        (remaining) => {
          setTimeLeft(remaining);
          updateProgress(remaining);
          if (activeSession && !Array.isArray(activeSession)) {
            updateSessionStatus({
              sessionId: activeSession._id as Id<"pomodoroSessions">,
              isRunning: true,
              remainingSeconds: remaining,
            });
          }
        },
        async () => {
          setIsRunning(false);
          if (activeSession && !Array.isArray(activeSession)) {
            await completeSession({
              sessionId: activeSession._id as Id<"pomodoroSessions">,
            });
          }
        }
      );
    }

    const totalSeconds = (savedSettings?.[mode] || DEFAULT_SETTINGS[mode]) * 60;

    if (!activeSession || Array.isArray(activeSession)) {
      await startSession({
        mode,
        totalSeconds,
      });
    } else {
      await updateSessionStatus({
        sessionId: activeSession._id as Id<"pomodoroSessions">,
        isRunning: true,
        remainingSeconds: timeLeft,
      });
    }

    timerRef.current.start(timeLeft);
    setIsRunning(true);
  };

  const pauseTimer = async () => {
    if (timerRef.current) {
      timerRef.current.stop();
      setIsRunning(false);

      if (activeSession && !Array.isArray(activeSession)) {
        await updateSessionStatus({
          sessionId: activeSession._id as Id<"pomodoroSessions">,
          isRunning: false,
          remainingSeconds: timeLeft,
        });
      }
    }
  };

  const handleModeChange = async (
    newMode: "work" | "shortBreak" | "longBreak"
  ) => {
    if (timerRef.current) {
      timerRef.current.stop();
    }

    if (activeSession && !Array.isArray(activeSession)) {
      await completeSession({
        sessionId: activeSession._id as Id<"pomodoroSessions">,
      });
    }

    setMode(newMode);
    const newTime =
      (savedSettings?.[newMode] || DEFAULT_SETTINGS[newMode]) * 60;
    setTimeLeft(newTime);
    setProgress(100);
    setIsRunning(false);
  };

  const handleReset = async () => {
    if (timerRef.current) {
      timerRef.current.stop();
    }

    if (activeSession && !Array.isArray(activeSession)) {
      await completeSession({
        sessionId: activeSession._id as Id<"pomodoroSessions">,
      });
    }

    const newTime = (savedSettings?.[mode] || DEFAULT_SETTINGS[mode]) * 60;
    setTimeLeft(newTime);
    setProgress(100);
    setIsRunning(false);
  };

  return {
    mode,
    isRunning,
    timeLeft,
    setTimeLeft,
    progress,
    startTimer,
    pauseTimer,
    handleModeChange,
    handleReset,
    initializeSession,
  };
}

export default function Pomodoro() {
  const savedSettings = useQuery(api.pomodoro.getSettings);
  const activeSession = useQuery(api.pomodoro.getActiveSession);
  const saveSettings = useMutation(api.pomodoro.saveSettings);
  const completeSession = useMutation(api.pomodoro.completeSession);
  const updateSessionStatus = useMutation(api.pomodoro.updateSessionStatus);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...DEFAULT_SETTINGS });
  const [currentQuote, setCurrentQuote] = useState({
    text: "",
    author: "",
    role: "",
    category: "",
    theme: "",
    backgroundColor: "",
    icon: "",
    index: 0,
  });
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    mode,
    isRunning,
    timeLeft,
    setTimeLeft,
    progress,
    startTimer,
    pauseTimer,
    handleModeChange,
    handleReset,
    initializeSession,
  } = useTimer(
    savedSettings && !Array.isArray(savedSettings) && savedSettings !== null
      ? {
          work: savedSettings.work,
          shortBreak: savedSettings.shortBreak,
          longBreak: savedSettings.longBreak,
        }
      : undefined,
    activeSession && !Array.isArray(activeSession) && activeSession !== null
      ? {
          _id: activeSession._id,
          mode: activeSession.mode,
          isRunning: activeSession.isRunning,
          remainingSeconds: activeSession.remainingSeconds,
          totalSeconds: activeSession.totalSeconds,
        }
      : undefined
  );

  useEffect(() => {
    if (activeSession !== undefined) {
      initializeSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  const handleTimerControl = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.quotes.length);
    setCurrentQuote({
      text: quotes.quotes[randomIndex].text || "",
      author: quotes.quotes[randomIndex].author || "",
      role: quotes.quotes[randomIndex].role || "",
      category: quotes.quotes[randomIndex].category || "",
      theme: quotes.quotes[randomIndex].theme || "",
      backgroundColor: quotes.quotes[randomIndex].backgroundColor || "",
      icon: quotes.quotes[randomIndex].icon || "",
      index: randomIndex,
    });
    setIsQuoteLoading(false);
  }, []);

  const handleQuoteChange = (direction: "next" | "prev") => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuote((current) => {
        const totalQuotes = quotes.quotes.length;
        const newIndex =
          direction === "next"
            ? (current.index + 1) % totalQuotes
            : (current.index - 1 + totalQuotes) % totalQuotes;
        return {
          ...quotes.quotes[newIndex],
          index: newIndex,
        };
      });
      setIsTransitioning(false);
    }, 200);
  };

  const handleSettingChange = (
    setting: keyof typeof tempSettings,
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

  const handleSaveSettings = async () => {
    await saveSettings(tempSettings);
    setIsSettingsOpen(false);
    setTimeLeft(tempSettings[mode] * 60);

    if (activeSession && !Array.isArray(activeSession)) {
      await completeSession({ sessionId: activeSession._id });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSettingsOpen = (open: boolean) => {
    setIsSettingsOpen(open);
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (activeSession && !Array.isArray(activeSession)) {
        await updateSessionStatus({
          sessionId: activeSession._id,
          isRunning: false,
          remainingSeconds: timeLeft,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeSession, timeLeft, updateSessionStatus]);

  return (
    <div className="pb-2 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Pomodoro Timer</h1>
          <p className="text-muted-foreground mt-1 text-xl font-light">
            Stay focused and maintain a healthy work-rest balance
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-6">
            <div className="w-full lg:w-1/2 flex flex-col items-center space-y-6">
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
              <div className="flex gap-4">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleTimerControl}
                        size="lg"
                        className={`h-14 w-14 rounded-full p-0 transition-all ${
                          isRunning
                            ? "bg-destructive hover:bg-destructive/90"
                            : "bg-primary hover:bg-primary/90"
                        }`}
                      >
                        {isRunning ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-0.5" />
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
                        className="h-14 w-14 rounded-full"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset timer</TooltipContent>
                  </Tooltip>
                  <Dialog
                    open={isSettingsOpen}
                    onOpenChange={handleSettingsOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Timer Settings</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {Object.entries(tempSettings).map(([key, value]) => (
                          <div key={key} className="grid gap-2">
                            <Label htmlFor={key} className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()} Time
                              (minutes)
                            </Label>
                            <Input
                              id={key}
                              type="number"
                              value={value}
                              onChange={(e) =>
                                handleSettingChange(
                                  key as keyof typeof tempSettings,
                                  e.target.value
                                )
                              }
                              min={1}
                              max={60}
                              className="dark:bg-muted/50"
                            />
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveSettings}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipProvider>
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <Tabs
                defaultValue="work"
                className="w-full"
                onValueChange={(value) =>
                  handleModeChange(value as "work" | "shortBreak" | "longBreak")
                }
              >
                <TabsList className="grid w-full grid-cols-3 p-0.5 dark:p-1">
                  {Object.entries(TIMER_MODES).map(
                    ([key, { label, icon: Icon }]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex items-center gap-2 border mx-0.5 dark:border-0 dark:mx-0"
                      >
                        <Icon className="h-4 w-4 hidden sm:block" />
                        <span>{label}</span>
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
              </Tabs>
              <Card className="border-none bg-muted/80 dark:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = TIMER_MODES[mode].icon;
                      return (
                        <Icon
                          className="h-5 w-5"
                          style={{ color: TIMER_MODES[mode].color }}
                        />
                      );
                    })()}
                    <CardTitle className="text-lg">
                      {TIMER_MODES[mode].label} Mode
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    {TIMER_MODES[mode].description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden group relative">
          {isQuoteLoading ? (
            <div className="relative h-full">
              <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-10 bg-primary/10" />
              <CardContent className="p-6 pb-4 relative h-full flex flex-col">
                <div className="flex mb-6">
                  <div className="w-full flex items-center justify-between gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
                <div className="flex-grow space-y-4">
                  <Skeleton className="h-8 w-[90%]" />
                  <Skeleton className="h-8 w-[75%]" />
                  <Skeleton className="h-8 w-[85%]" />
                </div>
                <div className="mt-auto space-y-4">
                  <div className="pt-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </div>
          ) : (
            <div className="relative h-full">
              <div
                className="absolute hidden md:block top-0 left-0 w-full h-1.5 bg-gradient-to-r md:bg-none"
                style={{
                  backgroundImage: `linear-gradient(to right, ${currentQuote.backgroundColor}50, ${currentQuote.backgroundColor}25)`,
                }}
              />
              <div
                className="absolute hidden md:block -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-20 bg-muted/50 md:bg-none"
                style={{ backgroundColor: currentQuote.backgroundColor }}
              />

              <CardContent className="p-6 pb-4 relative h-full flex flex-col">
                <div className="flex mb-6">
                  <div className="w-full flex items-center justify-between gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-xl bg-muted/50",
                        `md:${
                          QUOTE_COLORS[
                            currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                          ].bgLight
                        }`
                      )}
                    >
                      {(() => {
                        const Icon = getIconComponent(currentQuote.icon);
                        return (
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              "text-foreground",
                              `md:${
                                QUOTE_COLORS[
                                  currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                                ].text
                              }`
                            )}
                          />
                        );
                      })()}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "bg-muted/50",
                        `md:${
                          QUOTE_COLORS[
                            currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                          ].bgLight
                        }`,
                        `md:${
                          QUOTE_COLORS[
                            currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                          ].text
                        }`
                      )}
                    >
                      {currentQuote.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex-grow">
                  <div
                    className={cn(
                      "transition-opacity duration-200",
                      isTransitioning ? "opacity-0" : "opacity-100"
                    )}
                  >
                    <blockquote className="text-3xl font-light leading-relaxed mb-6 relative">
                      {currentQuote.text}
                    </blockquote>
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                  <div className="pt-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold",
                          "bg-muted/50 text-foreground",
                          `md:${
                            QUOTE_COLORS[
                              currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                            ].bgLight
                          }`,
                          `md:${
                            QUOTE_COLORS[
                              currentQuote.backgroundColor as keyof typeof QUOTE_COLORS
                            ].text
                          }`
                        )}
                      >
                        {currentQuote.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{currentQuote.author}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentQuote.role}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleQuoteChange("prev")}
                      disabled={isTransitioning}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleQuoteChange("next")}
                      disabled={isTransitioning}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
