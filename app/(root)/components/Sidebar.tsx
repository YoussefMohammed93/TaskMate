"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CalendarIcon, ClipboardList } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `flex items-center px-5 rounded-lg py-2 gap-x-2 mt-0.5 border ${
      pathname === path
        ? "border"
        : "border-transparent text-muted-foreground hover:border"
    }`;

  return (
    <aside className={className}>
      <div>
        <Link href="/" className={linkClasses("/")}>
          <ClipboardList className="size-5" />
          <span className="hidden md:block">Today</span>
        </Link>
      </div>
      <div>
        <Link href="/week" className={linkClasses("/week")}>
          <CalendarIcon className="size-5" />
          <span className="hidden md:block">Week</span>
        </Link>
      </div>
      <div>
        <Link href="/month" className={linkClasses("/month")}>
          <CalendarDays className="size-5" />
          <span className="hidden md:block">Month</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
