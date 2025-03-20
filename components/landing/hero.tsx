"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section
      aria-label="Hero Section"
      className="relative overflow-hidden bg-background pt-20"
    >
      <div
        role="presentation"
        className="absolute top-24 -left-64 w-96 h-96 bg-accent-foreground/15 dark:bg-primary/15 rounded-full blur-3xl"
      />
      <div
        role="presentation"
        className="absolute top-48 -right-64 w-96 h-96 bg-accent-foreground/10 dark:bg-primary/10 rounded-full blur-3xl"
      />
      <div className="relative text-center mx-auto max-w-6xl px-6">
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
          <ul className="mt-12 hidden sm:flex items-center justify-center gap-y-4 gap-x-10 text-sm">
            {[
              "No Credit Card Required",
              "Free Forever Plan",
              "Premium Features",
            ].map((text) => (
              <li key={text} className="flex items-center gap-x-2 group">
                <div className="bg-primary/10 rounded-full p-1 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                </div>
                <span className="text-muted-foreground font-medium">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
