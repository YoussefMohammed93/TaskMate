import { Header } from "@/components/landing/header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <AppSidebar />
        <main className="w-full flex-1 flex flex-col min-h-screen">
          <Header className="max-w-full pl-14 md:pl-5 bg-sidebar dark:bg-secondary" />
          <div className="fixed top-4 left-2 z-50">
            <SidebarTrigger />
          </div>
          <div className="flex-1 relative">
            <div className="h-full p-5">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
