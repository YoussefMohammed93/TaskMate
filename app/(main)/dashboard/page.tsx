"use client";

import {
  Target,
  ListTodo,
  Timer,
  Brain,
  Trophy,
  Calendar,
  Bell,
  Plus,
  MoreVertical,
  ChevronRight,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const stats = [
    {
      label: "Tasks Completed",
      value: 8,
      total: 10,
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+12%",
      trendUp: true,
      sparkline: [40, 35, 60, 75, 58, 62, 80],
    },
    {
      label: "Focus Time",
      value: 180,
      unit: "minutes",
      icon: Timer,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      trend: "+25%",
      trendUp: true,
      sparkline: [30, 45, 62, 70, 120, 155, 180],
    },
    {
      label: "Active Goals",
      value: 3,
      total: 5,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "-5%",
      trendUp: false,
      sparkline: [5, 4, 4, 5, 3, 4, 3],
    },
    {
      label: "Productivity Score",
      value: 85,
      total: 100,
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+8%",
      trendUp: true,
      sparkline: [65, 70, 72, 68, 75, 80, 85],
    },
  ];

  const todaysTasks = [
    {
      id: 1,
      title: "Complete project presentation",
      completed: true,
      dueTime: "10:00 AM",
      priority: "High",
      category: "Work",
      assignee: "Alex",
    },
    {
      id: 2,
      title: "Team meeting with design department",
      completed: false,
      dueTime: "11:30 AM",
      priority: "Medium",
      category: "Meeting",
      assignee: "Sarah",
    },
    {
      id: 4,
      title: "Prepare monthly analytics report",
      completed: false,
      dueTime: "4:30 PM",
      priority: "Medium",
      category: "Reporting",
      assignee: "Jamie",
    },
  ];

  const weeklyProgress = [
    {
      metric: "Focus Time",
      percentage: 85,
      color: "bg-red-500",
      lastWeek: 75,
      goal: 100,
    },
    {
      metric: "Tasks Completed",
      percentage: 70,
      color: "bg-blue-500",
      lastWeek: 65,
      goal: 80,
    },
    {
      metric: "Goals Achieved",
      percentage: 90,
      color: "bg-green-500",
      lastWeek: 85,
      goal: 100,
    },
  ];

  const activeGoals = [
    {
      title: "Complete Project X",
      progress: 65,
      dueDate: "Mar 28",
      tasks: 8,
      completedTasks: 5,
    },
    {
      title: "Launch Marketing Campaign",
      progress: 40,
      dueDate: "Apr 15",
      tasks: 12,
      completedTasks: 5,
    },
    {
      title: "Client Onboarding",
      progress: 80,
      dueDate: "Mar 25",
      tasks: 10,
      completedTasks: 8,
    },
  ];

  const MiniSparkline = ({
    data,
    color,
  }: {
    data: number[];
    color: string;
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        className="h-8 w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color.replace("text-", "stroke-")}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl">Welcome back, Youssef!</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="size-4 sm:size-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full border-2 border-background"></span>
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="size-4 sm:size-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="size-4 sm:size-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className={`size-4 sm:size-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <div className="flex items-end gap-1 sm:gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {stat.value}
                    </h3>
                    {stat.unit && (
                      <span className="text-xs sm:text-sm text-muted-foreground mb-1">
                        {stat.unit}
                      </span>
                    )}
                    {stat.total && (
                      <span className="text-xs sm:text-sm text-muted-foreground mb-1">
                        / {stat.total}
                      </span>
                    )}
                    <Badge
                      variant={stat.trendUp ? "default" : "destructive"}
                      className="ml-auto flex items-center gap-1 text-xs"
                    >
                      <TrendingUp className="h-3 w-3" /> {stat.trend}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <MiniSparkline data={stat.sparkline} color={stat.color} />
                {stat.total && (
                  <Progress
                    value={(stat.value / stat.total) * 100}
                    className="h-1 mt-1"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-4 sm:mt-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">My Workflow</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Plus className="size-3 sm:size-4 mr-1 sm:mr-2" /> Add New
              </Button>
            </div>
          </CardHeader>
          <Tabs defaultValue="tasks" className="px-2">
            <div className="px-2 sm:px-4 my-2">
              <TabsList className="grid grid-cols-3 mb-0">
                <TabsTrigger value="tasks" className="text-xs sm:text-sm">
                  <ListTodo className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="goals" className="text-xs sm:text-sm">
                  <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  Goals
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs sm:text-sm">
                  <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  Calendar
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="tasks" className="mt-0 p-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-medium">
                      Today&apos;s Tasks
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {todaysTasks.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center"
                    >
                      <Filter className="h-3 w-3 mr-1" /> Filter
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Sort by
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {todaysTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-lg border bg-sidebar dark:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="h-4 w-4 rounded border text-primary focus:ring"
                        />
                        <div className="min-w-0">
                          <span
                            className={`block text-sm sm:text-base ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : "font-medium"
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              {task.category}
                            </Badge>
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : task.priority === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs whitespace-nowrap"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.dueTime}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-muted-foreground hover:text-foreground text-sm"
                >
                  <Link href="/tasks">View All Tasks</Link>
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </CardContent>
            </TabsContent>
            <TabsContent value="goals" className="mt-0 p-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-medium">
                    Current Goals
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Add Goal
                  </Button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {activeGoals.map((goal, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border rounded-lg bg-sidebar dark:bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-medium truncate">
                            {goal.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Due {goal.dueDate}</span>
                            <span>•</span>
                            <ListTodo className="h-3 w-3" />
                            <span>
                              {goal.completedTasks}/{goal.tasks} tasks
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span>{goal.progress}% Complete</span>
                          <span className="text-muted-foreground">
                            {goal.completedTasks}/{goal.tasks}
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 p-0">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center py-8 sm:py-12 px-4">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Calendar View
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See your tasks organized by day, week, or month
                  </p>
                  <Button size="sm" className="text-sm">
                    <Link href="/calendar">Open Calendar</Link>
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Trophy className="size-4 sm:size-5 text-yellow-500" />
                  Weekly Progress
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {weeklyProgress.map((item) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-2 py-0.5 rounded bg-muted flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>
                            {item.percentage - item.lastWeek > 0 ? "+" : ""}
                            {item.percentage - item.lastWeek}%
                          </span>
                        </div>
                        <span className="text-muted-foreground font-medium">
                          {item.percentage}/{item.goal}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 border-t pt-4">
                <h4 className="text-xs sm:text-sm font-medium mb-4">
                  Weekly Highlights
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500/10 p-2 rounded">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">
                        Most productive day
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tuesday with 4.5 hours focus time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/10 p-2 rounded">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">
                        Achievement unlocked
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed 5 high-priority tasks in a row
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 px-3 sm:px-6 pb-3 sm:pb-4">
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                View Complete Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
