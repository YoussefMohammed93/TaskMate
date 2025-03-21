import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <AppSidebar />
        <main className="w-full flex-1 flex flex-col min-h-screen">
          <Header className="max-w-full pl-5 bg-sidebar dark:bg-secondary" />
          <div className="flex-1 relative">
            <div className="h-full p-5 pt-4">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
