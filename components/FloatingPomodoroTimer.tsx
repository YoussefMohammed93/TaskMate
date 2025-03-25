"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "convex/react";
import { Maximize2, Minimize2, Timer } from "lucide-react";

const TIMER_MODES = {
  work: {
    label: "Focus Time",
    color: "bg-green-500",
    textColor: "text-green-500",
  },
  shortBreak: {
    label: "Short Break",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
  },
  longBreak: {
    label: "Long Break",
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
} as const;

export function FloatingPomodoroTimer() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSession = useQuery(api.pomodoro.getActiveSession);
  const updateSessionStatus = useMutation(api.pomodoro.updateSessionStatus);
  const completeSession = useMutation(api.pomodoro.completeSession);

  const totalSeconds = activeSession?.totalSeconds || 1;
  const progress = Math.min(
    100,
    Math.max(0, ((totalSeconds - currentTime) / totalSeconds) * 100)
  );

  useEffect(() => {
    if (activeSession?.isRunning) {
      setCurrentTime(activeSession.remainingSeconds);

      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = Math.max(0, prevTime - 1);

          if (newTime % 5 === 0 || newTime === 0) {
            updateSessionStatus({
              sessionId: activeSession._id,
              isRunning: newTime > 0,
              remainingSeconds: newTime,
            });
          }

          if (newTime === 0) {
            completeSession({ sessionId: activeSession._id });
          }

          return newTime;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (activeSession) {
        setCurrentTime(activeSession.remainingSeconds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSession?.isRunning,
    activeSession?.remainingSeconds,
    activeSession?._id,
  ]);

  if (
    pathname === "/pomodoro" ||
    !activeSession ||
    !activeSession.isRunning ||
    activeSession.completed
  ) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentMode =
    TIMER_MODES[activeSession.mode as keyof typeof TIMER_MODES];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="relative overflow-hidden w-[140px]">
          <Progress
            value={progress}
            className={cn("h-1 rounded-none", currentMode.color)}
          />
          <div className="p-2 flex items-center justify-between">
            <div className={cn("font-medium", currentMode.textColor)}>
              {formatTime(currentTime)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-[300px] overflow-hidden">
        <div className="relative">
          <Progress
            value={progress}
            className={cn("h-1.5 rounded-none", currentMode.color)}
          />

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer className={cn("h-4 w-4", currentMode.textColor)} />
                <span className="text-sm font-medium">{currentMode.label}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={cn(
                "text-4xl font-semibold text-center my-4",
                currentMode.textColor
              )}
            >
              {formatTime(currentTime)}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link
                href="/pomodoro"
                className="hover:text-foreground transition-colors"
              >
                <Button variant="link">View Details</Button>
              </Link>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
