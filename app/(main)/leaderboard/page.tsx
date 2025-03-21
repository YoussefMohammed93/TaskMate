"use client";

import {
  Trophy,
  Medal,
  Crown,
  Target,
  Flame,
  Star,
  Search,
  Users,
  Timer,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserStatsData = {
  score: number;
  rank: number;
  streak: number;
  tasksCompleted: number;
  focusMinutes: number;
};

type TimePeriodStats = {
  [key: string]: UserStatsData;
};

type UserStats = {
  weekly: TimePeriodStats;
  monthly: TimePeriodStats;
  allTime: TimePeriodStats;
};

const BASE_USERS = [
  {
    id: "1",
    name: "Sarah Johnson",
    image: "https://i.pravatar.cc/150?img=1",
    badges: ["productivity_master", "focus_champion", "streak_warrior"],
    level: 32,
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Michael Chen",
    image: "https://i.pravatar.cc/150?img=3",
    badges: ["task_master", "early_bird"],
    level: 28,
    joinedDate: "2024-01-20",
  },
  {
    id: "3",
    name: "Emma Davis",
    image: "https://i.pravatar.cc/150?img=5",
    badges: ["streak_warrior", "goal_crusher"],
    level: 27,
    joinedDate: "2024-01-25",
  },
  {
    id: "4",
    name: "James Wilson",
    image: "https://i.pravatar.cc/150?img=4",
    badges: ["focus_champion"],
    level: 25,
    joinedDate: "2024-01-28",
  },
  {
    id: "5",
    name: "Sofia Rodriguez",
    image: "https://i.pravatar.cc/150?img=6",
    badges: ["rising_star"],
    level: 23,
    joinedDate: "2024-02-01",
  },
  {
    id: "6",
    name: "David Kim",
    image: "https://i.pravatar.cc/150?img=7",
    badges: ["early_bird"],
    level: 22,
    joinedDate: "2024-02-05",
  },
  {
    id: "7",
    name: "Lisa Thompson",
    image: "https://i.pravatar.cc/150?img=9",
    badges: ["task_master"],
    level: 21,
    joinedDate: "2024-02-10",
  },
  {
    id: "8",
    name: "Alex Turner",
    image: "https://i.pravatar.cc/150?img=8",
    badges: ["rising_star"],
    level: 20,
    joinedDate: "2024-02-15",
  },
];

const USER_STATS: UserStats = {
  weekly: {
    "1": {
      score: 850,
      rank: 1,
      streak: 5,
      tasksCompleted: 45,
      focusMinutes: 800,
    },
    "2": {
      score: 720,
      rank: 2,
      streak: 4,
      tasksCompleted: 32,
      focusMinutes: 600,
    },
    "3": {
      score: 680,
      rank: 3,
      streak: 8,
      tasksCompleted: 30,
      focusMinutes: 650,
    },
    "4": {
      score: 650,
      rank: 4,
      streak: 3,
      tasksCompleted: 25,
      focusMinutes: 500,
    },
    "5": {
      score: 620,
      rank: 5,
      streak: 2,
      tasksCompleted: 20,
      focusMinutes: 450,
    },
    "6": {
      score: 580,
      rank: 6,
      streak: 1,
      tasksCompleted: 15,
      focusMinutes: 400,
    },
    "7": {
      score: 550,
      rank: 7,
      streak: 0,
      tasksCompleted: 10,
      focusMinutes: 350,
    },
    "8": {
      score: 520,
      rank: 8,
      streak: 0,
      tasksCompleted: 8,
      focusMinutes: 300,
    },
  },
  monthly: {
    "1": {
      score: 2850,
      rank: 1,
      streak: 15,
      tasksCompleted: 145,
      focusMinutes: 2400,
    },
    "2": {
      score: 2720,
      rank: 2,
      streak: 12,
      tasksCompleted: 132,
      focusMinutes: 2100,
    },
    "3": {
      score: 2680,
      rank: 3,
      streak: 18,
      tasksCompleted: 128,
      focusMinutes: 2300,
    },
    "4": {
      score: 2550,
      rank: 4,
      streak: 10,
      tasksCompleted: 115,
      focusMinutes: 2000,
    },
    "5": {
      score: 2420,
      rank: 5,
      streak: 9,
      tasksCompleted: 108,
      focusMinutes: 1950,
    },
    "6": {
      score: 2380,
      rank: 6,
      streak: 7,
      tasksCompleted: 102,
      focusMinutes: 1850,
    },
    "7": {
      score: 2290,
      rank: 7,
      streak: 6,
      tasksCompleted: 95,
      focusMinutes: 1750,
    },
    "8": {
      score: 2200,
      rank: 8,
      streak: 8,
      tasksCompleted: 98,
      focusMinutes: 1800,
    },
  },
  allTime: {
    "1": {
      score: 12850,
      rank: 1,
      streak: 45,
      tasksCompleted: 545,
      focusMinutes: 8400,
    },
    "2": {
      score: 11720,
      rank: 2,
      streak: 38,
      tasksCompleted: 432,
      focusMinutes: 7100,
    },
    "3": {
      score: 11360,
      rank: 3,
      streak: 36,
      tasksCompleted: 400,
      focusMinutes: 6800,
    },
    "4": {
      score: 10900,
      rank: 4,
      streak: 30,
      tasksCompleted: 350,
      focusMinutes: 6400,
    },
    "5": {
      score: 10440,
      rank: 5,
      streak: 25,
      tasksCompleted: 300,
      focusMinutes: 6000,
    },
    "6": {
      score: 9980,
      rank: 6,
      streak: 20,
      tasksCompleted: 250,
      focusMinutes: 5600,
    },
    "7": {
      score: 9520,
      rank: 7,
      streak: 15,
      tasksCompleted: 200,
      focusMinutes: 5200,
    },
    "8": {
      score: 9060,
      rank: 8,
      streak: 10,
      tasksCompleted: 150,
      focusMinutes: 4800,
    },
  },
};

interface BadgeIcon {
  icon: React.ElementType;
  color: string;
}

const BADGE_ICONS: Record<string, BadgeIcon> = {
  productivity_master: { icon: Crown, color: "text-yellow-500" },
  focus_champion: { icon: Target, color: "text-blue-500" },
  streak_warrior: { icon: Flame, color: "text-orange-500" },
  task_master: { icon: CheckCircle2, color: "text-green-500" },
  early_bird: { icon: Timer, color: "text-purple-500" },
  goal_crusher: { icon: Trophy, color: "text-pink-500" },
  rising_star: { icon: Star, color: "text-indigo-500" },
};

const TIME_PERIODS = [
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "allTime", label: "All Time" },
];

const CURRENT_USER_ID = "2";

export default function Leaderboard() {
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-700";
      default:
        return "text-muted-foreground";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  const isCurrentUser = (userId: string) => userId === CURRENT_USER_ID;

  const getUsersWithStats = () => {
    return BASE_USERS.map((user) => ({
      ...user,
      ...USER_STATS[timePeriod as keyof typeof USER_STATS][
        user.id as keyof (typeof USER_STATS)[keyof typeof USER_STATS]
      ],
    })).sort((a, b) => b.score - a.score);
  };

  const filteredUsers = getUsersWithStats().filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="pb-2 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1 text-xl font-light">
            Track progress and compete with others
          </p>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {filteredUsers.length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Active participants this {timePeriod}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Avg. Score
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {Math.round(
                filteredUsers.reduce((acc, user) => acc + user.score, 0) /
                  filteredUsers.length
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Points per user
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Tasks
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {filteredUsers.reduce(
                (acc, user) => acc + user.tasksCompleted,
                0
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Completed tasks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Focus Time
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {Math.round(
                filteredUsers.reduce(
                  (acc, user) => acc + user.focusMinutes,
                  0
                ) / 60
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Total hours
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-3xl">Rankings</CardTitle>
        </CardHeader>
        <CardContent
          className="p-4 sm:p-6"
          style={{ paddingTop: "0 !important" }}
        >
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 dark:bg-muted/50 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-8 text-center font-bold ${getRankColor(
                      user.rank
                    )}`}
                  >
                    #{user.rank}
                  </div>
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-muted">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2 text-sm sm:text-base">
                      {user.name}
                      {isCurrentUser(user.id) && (
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                      Level {user.level}
                      <span className="flex gap-1">
                        {user.badges.map((badge) => {
                          const BadgeIcon = BADGE_ICONS[badge].icon;
                          return (
                            <BadgeIcon
                              key={badge}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${BADGE_ICONS[badge].color}`}
                            />
                          );
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      <span>{user.tasksCompleted} tasks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                      <span>{user.streak} day streak</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm sm:text-base">
                      {user.score}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      points
                    </div>
                  </div>
                  {getRankIcon(user.rank)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
