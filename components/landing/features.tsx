"use client";

import {
  Brain,
  Clock,
  Target,
  ListTodo,
  Sparkles,
  MessageSquareMore,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ListTodo,
    title: "Task Management",
    description:
      "Organize your tasks with intuitive drag-and-drop interfaces and smart categorization.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/5 dark:bg-blue-500/10",
  },
  {
    icon: Clock,
    title: "Pomodoro Timer",
    description:
      "Boost productivity with customizable focus sessions and break intervals.",
    color: "text-red-500",
    bgColor: "bg-red-500/5 dark:bg-red-500/10",
  },
  {
    icon: Brain,
    title: "Mind Mapping",
    description:
      "Visualize your ideas and connect thoughts with interactive mind maps.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/5 dark:bg-purple-500/10",
  },
  {
    icon: MessageSquareMore,
    title: "Smart Notes",
    description:
      "Create, organize, and link your notes with powerful formatting options.",
    color: "text-green-500",
    bgColor: "bg-green-500/5 dark:bg-green-500/10",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Set, monitor, and achieve your goals with progress visualization.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/5 dark:bg-orange-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Get intelligent suggestions and task optimization recommendations.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/5 dark:bg-pink-500/10",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative pb-20 overflow-hidden"
      aria-label="Features Section"
    >
      <div
        role="presentation"
        className="dark:block absolute top-1/4 -left-64 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl"
      />
      <div
        role="presentation"
        className="dark:block absolute top-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
      />
      <div className="relative mx-auto max-w-[1260px] px-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Powerful Features for Enhanced Productivity
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to stay organized, focused, and productive in
            one seamless workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative group h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative p-6 bg-card dark:bg-secondary rounded-2xl border transition-all duration-300 h-full flex flex-col">
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    feature.bgColor
                  )}
                />
                <div className="relative flex flex-col flex-1">
                  <div
                    className={cn(
                      "inline-flex p-3 rounded-xl transition-colors duration-300 w-fit",
                      feature.bgColor
                    )}
                  >
                    <feature.icon className={cn("size-6", feature.color)} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
