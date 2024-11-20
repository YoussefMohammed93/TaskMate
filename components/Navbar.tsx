import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { LogOutButton } from "./logout-button";
import { SignInButton } from "./signin-button";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm border-b px-5 sm:px-10 md:px-16 lg:px-24">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-x-2">
          <div className="w-12 h-12 relative">
            <Image src="/logo.svg" alt="Logo" loading="eager" fill />
          </div>
          <span className="text-xl font-semibold">Taskmate</span>
        </Link>
        <div className="flex items-center gap-x-5">
          {session && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-x-2 cursor-pointer">
                  <Image
                    src={session?.user?.image || "/avatar.png"}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="font-normal">
                  Welcome, {session?.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={`/settings`}
                    className="flex items-center gap-x-2"
                  >
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
