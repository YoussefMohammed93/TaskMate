"use client";

import {
  Sun,
  Moon,
  Timer,
  Check,
  Monitor,
  ListTodo,
  Settings,
  ArrowRight,
  ChevronRight,
  CircleCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  {
    icon: ListTodo,
    title: "Create Your Workspace",
    description:
      "Set up your personalized workspace and organize your tasks into custom categories.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/5 dark:bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50",
  },
  {
    icon: Timer,
    title: "Set Your Schedule",
    description:
      "Configure your Pomodoro intervals and break times to match your work style and preferences.",
    color: "text-green-500",
    bgColor: "bg-green-500/5 dark:bg-green-500/10",
    borderColor: "group-hover:border-green-500/50",
  },
  {
    icon: Settings,
    title: "Customize Features",
    description:
      "Customize your notifications, theme preferences, and productivity settings to suit your needs.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/5 dark:bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50",
  },
  {
    icon: Check,
    title: "Track Progress",
    description:
      "Monitor your productivity metrics and achieve your daily goals efficiently with TaskMate.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/5 dark:bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/50",
  },
];

export function HowItWorks() {
  const { theme, setTheme } = useTheme();

  const isAuthenticated = useAuth().isSignedIn;

  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative pb-24 overflow-hidden bg-gradient-to-b from-background to-background/90">
        <div className="relative mx-auto max-w-[1280px] px-5">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-[300px] mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <div className="bg-card dark:bg-secondary backdrop-blur-sm border rounded-xl p-6">
                {[1, 2, 3, 4].map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "group flex items-start p-4 rounded-lg",
                      idx < 3 && "mb-2"
                    )}
                  >
                    <Skeleton className="size-10 rounded-lg shrink-0 mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </div>
                    <Skeleton className="size-5 shrink-0 self-center ml-2" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-card dark:bg-secondary border pb-[26px]">
                <div className="p-8">
                  <Skeleton className="size-16 rounded-2xl mb-6" />
                  <Skeleton className="h-9 w-64 mb-4" />
                  <Skeleton className="h-5 w-full mb-8" />
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-background rounded-lg p-3 border"
                        >
                          <Skeleton className="h-2 w-12 mb-2" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="size-2 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <Skeleton className="h-9 w-28 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="how-it-works"
      className="relative pb-24 overflow-hidden bg-gradient-to-b from-background to-background/90"
      aria-label="How It Works Section"
    >
      <div
        role="presentation"
        className="dark:block absolute top-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
      />
      <div
        role="presentation"
        className="dark:block absolute bottom-1/4 -right-64 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
      />
      <div className="relative mx-auto max-w-[1260px] px-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            How TaskMate Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with TaskMate in four simple steps and transform your
            productivity journey.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 h-full">
            <div className="bg-card dark:bg-secondary backdrop-blur-sm border rounded-xl p-6 sticky top-24 h-full">
              {steps.map((step, idx) => (
                <div
                  key={`nav-${step.title}`}
                  className={cn(
                    "group flex items-start p-4 rounded-lg cursor-pointer transition-all duration-300",
                    activeStep === idx ? "bg-primary/5" : "hover:bg-primary/5",
                    idx < steps.length - 1 && "mb-2"
                  )}
                  onClick={() => setActiveStep(idx)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-10 rounded-lg mr-4 transition-colors",
                      step.bgColor,
                      activeStep === idx ? step.color : "text-foreground/70"
                    )}
                  >
                    {activeStep > idx ? (
                      <CircleCheck className="size-5" />
                    ) : (
                      <span className="font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={cn(
                        "font-medium text-lg transition-colors",
                        activeStep === idx
                          ? "text-foreground"
                          : "text-foreground/70"
                      )}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={cn(
                        "text-sm transition-colors line-clamp-1",
                        activeStep === idx
                          ? "text-muted-foreground"
                          : "text-muted-foreground/70"
                      )}
                    >
                      {step.description.substring(0, 60)}...
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-5 text-foreground/30 self-center transition-transform",
                      activeStep === idx && "transform rotate-90"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative">
              {steps.map((step, idx) => (
                <div
                  key={`detail-${step.title}`}
                  className={cn(
                    "group rounded-2xl bg-card dark:bg-secondary border transition-all duration-500 overflow-hidden",
                    activeStep === idx
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 absolute top-0 left-0 right-0",
                    step.borderColor
                  )}
                  style={{
                    display: activeStep === idx ? "block" : "none",
                  }}
                >
                  <div className="p-8">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center p-4 rounded-2xl mb-6",
                        step.bgColor
                      )}
                    >
                      <step.icon className={cn("size-8", step.color)} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 flex items-center">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-8">
                      {step.description}
                    </p>
                    <div className="mb-6">
                      {idx === 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="bg-background rounded-lg p-3 border"
                            >
                              <div className="h-2 w-12 bg-muted-foreground/20 rounded mb-2"></div>
                              <div className="h-2 w-16 bg-muted-foreground/10 rounded"></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-center">
                            <div className="size-12 rounded-full border-4 flex items-center justify-center mb-2">
                              <span className="text-sm font-bold">25</span>
                            </div>
                            <span className="text-xs">Work</span>
                          </div>
                          <div className="h-0.5 flex-1 bg-muted-foreground/20 mx-2"></div>
                          <div className="flex flex-col items-center">
                            <div className="size-8 rounded-full border-2 flex items-center justify-center mb-2">
                              <span className="text-xs font-bold">5</span>
                            </div>
                            <span className="text-xs">Break</span>
                          </div>
                          <div className="h-0.5 flex-1 bg-muted-foreground/20 mx-2"></div>
                          <div className="flex flex-col items-center">
                            <div className="size-12 rounded-full border-4 flex items-center justify-center mb-2">
                              <span className="text-sm font-bold">25</span>
                            </div>
                            <span className="text-xs">Work</span>
                          </div>
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            className={cn(
                              "rounded-lg p-2 sm:p-3 flex items-center justify-between cursor-pointer transition-colors w-full",
                              "bg-background border",
                              theme === "system" &&
                                "bg-primary/5 text-primary border-primary/50"
                            )}
                            onClick={() => setTheme("system")}
                          >
                            <div className="flex items-center">
                              <Monitor className="size-4 sm:size-5 mr-1.5 sm:mr-2" />
                              <span className="text-xs sm:text-sm font-medium">
                                System
                              </span>
                            </div>
                            {theme === "system" && (
                              <Check className="size-3 sm:size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "rounded-lg p-2 sm:p-3 flex items-center justify-between cursor-pointer transition-colors w-full",
                              "bg-background border",
                              theme === "light" &&
                                "bg-primary/5 text-primary border-primary/50"
                            )}
                            onClick={() => setTheme("light")}
                          >
                            <div className="flex items-center">
                              <Sun className="size-4 sm:size-5 mr-1.5 sm:mr-2" />
                              <span className="text-xs sm:text-sm font-medium">
                                Light
                              </span>
                            </div>
                            {theme === "light" && (
                              <Check className="size-3 sm:size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "rounded-lg p-2 sm:p-3 flex items-center justify-between cursor-pointer transition-colors w-full",
                              "bg-background border",
                              theme === "dark" &&
                                "bg-primary/5 text-primary border-primary/50"
                            )}
                            onClick={() => setTheme("dark")}
                          >
                            <div className="flex items-center">
                              <Moon className="size-4 sm:size-5 mr-1.5 sm:mr-2" />
                              <span className="text-xs sm:text-sm font-medium">
                                Dark
                              </span>
                            </div>
                            {theme === "dark" && (
                              <Check className="size-3 sm:size-4" />
                            )}
                          </button>
                        </div>
                      )}
                      {idx === 3 && (
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-pink-500/50 rounded-full"></div>
                          </div>
                          <div className="h-3 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-blue-500/50 rounded-full"></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Tasks Completed</span>
                            <span>75%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Step {idx + 1} of {steps.length}
                        </span>
                        <div className="flex space-x-1 mt-2">
                          {steps.map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className={cn(
                                "size-2 rounded-full",
                                dotIdx === idx
                                  ? "bg-primary"
                                  : "bg-muted-foreground/20"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {idx !== steps.length - 1 ? (
                        <button
                          onClick={() =>
                            setActiveStep((idx + 1) % steps.length)
                          }
                          className={cn(
                            "cursor-pointer flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            `${step.bgColor} ${step.color} hover:bg-opacity-80`
                          )}
                        >
                          Next Step
                          <ArrowRight className="ml-2 size-4" />
                        </button>
                      ) : (
                        <Link
                          href="/dashboard"
                          className={cn(
                            "cursor-pointer flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
