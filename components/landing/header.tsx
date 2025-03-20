import { Logo } from "../logo";
import { cn } from "@/lib/utils";
import UserButton from "../user-button";

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
        <Logo />
        <UserButton />
      </div>
    </header>
  );
};
