"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  ListTodo,
  Timer,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const generateWeeklyFocusData = (selectedDate: Date) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const seed = weekStart.getTime();
  const random = (min: number, max: number, seed: number) => {
    const x = Math.sin(seed) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1) + min);
  };

  return Array.from({ length: 7 }).map((_, index) => {
    const currentDay = addDays(weekStart, index);
    const dayName = format(currentDay, "EEEE");
    const daySeed = seed + index;

    return {
      day: dayName,
      focusTime: random(200, 400, daySeed),
      breakTime: random(45, 90, daySeed + 1),
    };
  });
};

const generateSessionData = (selectedDate: Date) => {
  const seed = startOfWeek(selectedDate, { weekStartsOn: 1 }).getTime();
  const random = (min: number, max: number, seed: number) => {
    const x = Math.sin(seed) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1) + min);
  };

  return [
    { type: "Complete", sessions: random(20, 30, seed) },
    { type: "Interrupted", sessions: random(5, 10, seed + 1) },
    { type: "Skipped", sessions: random(2, 6, seed + 2) },
  ];
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Analytics() {
  const [date, setDate] = useState<Date>(new Date());

  const weeklyFocusData = generateWeeklyFocusData(date);
  const sessionDistributionData = generateSessionData(date);

  const analyticsData = {
    tasks: {
      completion: [
        { month: "Jan", completed: 45, total: 52 },
        { month: "Feb", completed: 48, total: 55 },
        { month: "Mar", completed: 52, total: 58 },
        { month: "Apr", completed: 49, total: 53 },
        { month: "May", completed: 55, total: 60 },
        { month: "Jun", completed: 58, total: 62 },
      ],
      categoryDistribution: [
        { category: "Development", count: 25 },
        { category: "Design", count: 18 },
        { category: "Research", count: 15 },
        { category: "Planning", count: 12 },
        { category: "Review", count: 10 },
      ],
      priorityBreakdown: {
        high: 35,
        medium: 45,
        low: 20,
      },
    },

    goals: {
      progressOverTime: [
        { week: "Week 1", completed: 3, inProgress: 5, total: 10 },
        { week: "Week 2", completed: 5, inProgress: 4, total: 10 },
        { week: "Week 3", completed: 7, inProgress: 3, total: 10 },
        { week: "Week 4", completed: 8, inProgress: 2, total: 10 },
      ],
      categoryCompletion: [
        { category: "Personal", completed: 80, total: 100 },
        { category: "Professional", completed: 65, total: 100 },
        { category: "Learning", completed: 90, total: 100 },
        { category: "Health", completed: 75, total: 100 },
      ],
    },

    pomodoro: {
      weeklyFocus: weeklyFocusData,
      sessionDistribution: sessionDistributionData,
    },
  };

  return (
    <div className="pb-2 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-xl font-light">
            Track your progress and performance
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal dark:bg-muted/50"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day: Date | undefined) => day && setDate(day)}
              initialFocus
              className="w-full rounded-md border-0 dark:bg-muted/50"
              classNames={{
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
          </PopoverContent>
        </Popover>
      </div>
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger
            value="tasks"
            className="data-[state=active]:bg-muted-foreground/10"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="data-[state=active]:bg-muted-foreground/10"
          >
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger
            value="pomodoro"
            className="data-[state=active]:bg-muted-foreground/10"
          >
            <Timer className="h-4 w-4 mr-2" />
            Pomodoro
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-9 bg-card">
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.tasks.completion}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted-foreground))"
                        opacity={0.2}
                      />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--popover-foreground))",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        fill="hsl(var(--chart-1))"
                        name="Completed Tasks"
                      />
                      <Bar
                        dataKey="total"
                        fill="hsl(var(--chart-2))"
                        name="Total Tasks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-3 bg-card">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.tasks.categoryDistribution}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analyticsData.tasks.categoryDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-5 bg-card">
              <CardHeader>
                <CardTitle>Goal Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.goals.progressOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        fill="#8884d8"
                        name="Completed Goals"
                      />
                      <Bar
                        dataKey="inProgress"
                        fill="#82ca9d"
                        name="In Progress"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-7 bg-card">
              <CardHeader>
                <CardTitle>Category Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.goals.categoryCompletion}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="category" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        fill="#8884d8"
                        name="Completion Rate (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pomodoro" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-9 bg-card">
              <CardHeader>
                <CardTitle>Weekly Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.pomodoro.weeklyFocus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="focusTime"
                        fill="#8884d8"
                        name="Focus Time (min)"
                      />
                      <Bar
                        dataKey="breakTime"
                        fill="#82ca9d"
                        name="Break Time (min)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-3 bg-card">
              <CardHeader>
                <CardTitle>Session Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.pomodoro.sessionDistribution}
                        dataKey="sessions"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analyticsData.pomodoro.sessionDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export interface DateRange {
  from: Date;
  to: Date;
}
