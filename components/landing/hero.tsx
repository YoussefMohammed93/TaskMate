"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Infinity, Trophy, Sparkles } from "lucide-react";

const features = [
  {
    text: "Free Forever Plan",
    icon: "Infinity",
    color: "text-green-500",
    description: "Access core features without any cost",
  },
  {
    text: "Premium Features",
    icon: "Crown",
    color: "text-yellow-500",
    description: "Unlock advanced productivity tools",
  },
  {
    text: "Monthly Leaderboard",
    icon: "Trophy",
    color: "text-blue-500",
    description: "Compete with other users and track progress",
  },
] as const;

const IconComponent = ({ icon, color }: { icon: string; color: string }) => {
  switch (icon) {
    case "Infinity":
      return <Infinity aria-hidden="true" className={cn("size-4", color)} />;
    case "Crown":
      return <Crown aria-hidden="true" className={cn("size-4", color)} />;
    case "Trophy":
      return <Trophy aria-hidden="true" className={cn("size-4", color)} />;
    default:
      return null;
  }
};

export function Hero() {
  return (
    <section
      aria-label="Hero Section"
      className="relative overflow-hidden bg-background py-20"
    >
      <div
        role="presentation"
        className="absolute top-24 -left-64 w-96 h-96 bg-sky-500/15 dark:bg-primary/15 rounded-full blur-3xl"
      />
      <div
        role="presentation"
        className="absolute top-12 -right-64 w-96 h-96 bg-orange-500/10 dark:bg-primary/10 rounded-full blur-3xl"
      />
      <div className="relative text-center mx-auto max-w-[1260px] px-5">
        <div
          role="banner"
          className="inline-flex items-center justify-center gap-x-2 bg-secondary dark:bg-primary/10 px-5 py-2 rounded-full mb-10 border"
        >
          <Sparkles
            aria-hidden="true"
            className="size-4 text-primary animate-pulse"
          />
          <span className="text-sm font-semibold text-primary">
            The Ultimate Productivity Tool
          </span>
        </div>
        <article className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight md:text-6xl bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent pb-2">
            Your Personal Productivity Companion
          </h1>
          <p className="mt-8 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Transform your daily workflow with TaskMate. Seamlessly manage
            tasks, boost focus with Pomodoro sessions, and organize thoughts
            with digital sticky notes — all in one elegant workspace.
          </p>
          <nav className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-y-4 gap-x-6">
            <Link
              href="/dashboard"
              className="w-full sm:w-fit"
              aria-label="Get started with TaskMate for free"
            >
              <Button
                size="lg"
                className="w-full text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
                <ArrowRight aria-hidden="true" className="size-4 ml-1" />
              </Button>
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-fit"
              aria-label="Learn more about TaskMate features"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#features")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base font-medium hover:bg-primary/5 transition-colors"
              >
                Learn more
              </Button>
            </Link>
          </nav>
          <ul className="mt-12 mb-5 hidden sm:flex items-center justify-center gap-x-12 text-sm">
            {features.map(({ text, icon, color }) => (
              <li key={text} className="flex items-center gap-x-3">
                <div className="bg-background dark:bg-primary/10 rounded-full p-2 ring-1 ring-border">
                  <IconComponent icon={icon} color={color} />
                </div>
                <span className="text-muted-foreground font-medium group-hover:text-primary transition-colors">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
