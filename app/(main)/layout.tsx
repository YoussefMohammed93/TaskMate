"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FloatingPomodoroTimer } from "@/components/FloatingPomodoroTimer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDocumentPage =
    pathname.startsWith("/documents/") && pathname !== "/documents";

  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <AppSidebar />
        <main className="w-full flex-1 flex flex-col min-h-screen">
          <Header className="max-w-full pl-5 bg-sidebar dark:bg-secondary" />
          <div className="flex-1 relative">
            <div className={cn("h-full", isDocumentPage ? "p-0" : "p-5 pt-4")}>
              {children}
            </div>
          </div>
        </main>
        <div className="hidden md:block">
          <FloatingPomodoroTimer />
        </div>
      </div>
    </SidebarProvider>
  );
}
