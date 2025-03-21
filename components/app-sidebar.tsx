"use client";

import {
  LayoutDashboard,
  Calendar,
  Target,
  BarChart3,
  ListTodo,
  Timer,
  StickyNote,
  Trophy,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: StickyNote,
  },
  {
    title: "Pomodoro",
    url: "/pomodoro",
    icon: Timer,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.currentUser);

  const renderHeader = () => {
    return (
      <div className="flex flex-col min-w-0 px-2 pt-1">
        {currentUser ? (
          <>
            <span className="font-semibold truncate">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-5 w-32 mb-1 bg-muted-foreground/10" />
            <Skeleton className="h-4 w-48 bg-muted-foreground/10" />
          </>
        )}
      </div>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b dark:bg-secondary h-[63px]">
        {renderHeader()}
      </SidebarHeader>
      <SidebarContent className="dark:bg-secondary">
        <SidebarGroup>
          <div className="space-y-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(isActive && "bg-muted-foreground/10")}
                      >
                        <Link href={item.url} className="gap-2">
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive && "text-primary"
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
