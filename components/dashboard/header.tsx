import { Logo } from "../logo";
import { cn } from "@/lib/utils";
import UserButton from "../user-button";
import { SidebarTrigger } from "../ui/sidebar";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card dark:bg-secondary border-b">
      <div
        className={cn(
          "max-w-[1280px] mx-auto flex items-center justify-between gap-5 px-5 py-1.5",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div>
            <SidebarTrigger />
          </div>
          <Logo />
        </div>
        <UserButton />
      </div>
    </header>
  );
};
