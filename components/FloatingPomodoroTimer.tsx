"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";

const TIMER_MODES = {
  work: { label: "Focus", color: "#33ca5a" },
  shortBreak: { label: "Short Break", color: "#f59e0b" },
  longBreak: { label: "Long Break", color: "#3b82f6" },
};

export function FloatingPomodoroTimer() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);

  const activeSession = useQuery(api.pomodoro.getActiveSession);
  const updateSessionStatus = useMutation(api.pomodoro.updateSessionStatus);
  const completeSession = useMutation(api.pomodoro.completeSession);

  useEffect(() => {
    if (activeSession?.isRunning) {
      setCurrentTime(activeSession.remainingSeconds);
      lastUpdateTimeRef.current = Date.now();

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
          timerRef.current = null;
        }
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
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

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 transition-all duration-200",
        isMinimized ? "w-auto" : "w-[300px]"
      )}
    >
      <div className="bg-background border rounded-lg shadow-lg">
        {isMinimized ? (
          <div className="p-3 flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor:
                  TIMER_MODES[activeSession.mode as keyof typeof TIMER_MODES]
                    .color,
              }}
            />
            <span className="font-medium">{formatTime(currentTime)}</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor:
                      TIMER_MODES[
                        activeSession.mode as keyof typeof TIMER_MODES
                      ].color,
                  }}
                />
                <span className="font-medium">
                  {
                    TIMER_MODES[activeSession.mode as keyof typeof TIMER_MODES]
                      .label
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-2xl font-medium text-center mb-3">
              {formatTime(currentTime)}
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/pomodoro"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Open Timer
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
