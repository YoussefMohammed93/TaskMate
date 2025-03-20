import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/landing/header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <AppSidebar />
        <main className="w-full flex-1 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 relative">
            <div className="absolute top-2 left-2 z-40">
              <SidebarTrigger />
            </div>
            <div className="h-full p-6 pt-12">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
