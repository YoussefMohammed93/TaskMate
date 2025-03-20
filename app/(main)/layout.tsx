import { Header } from "@/components/landing/header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <AppSidebar />
        <main className="w-full flex-1 flex flex-col min-h-screen">
          <Header className="max-w-full bg-sidebar dark:bg-secondary" />
          <div className="flex-1 relative">
            <div className="absolute top-2 left-2 z-40">
              <SidebarTrigger />
            </div>
            <div className="h-full p-5">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
