"use client";

import {
  Check,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import UserAvatar from "./user-avatar";
import { useQuery } from "convex/react";
import { Separator } from "./ui/separator";
import { api } from "@/convex/_generated/api";
import { useAuth, SignInButton } from "@clerk/nextjs";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const currentUser = useQuery(api.users.currentUser);
  const { isSignedIn, isLoaded: isAuthLoaded, signOut } = useAuth();

  const { theme, setTheme } = useTheme();

  const handleSignout = () => {
    signOut();
  };

  if (!isAuthLoaded || (isSignedIn && !currentUser)) {
    return (
      <div className={cn("flex-none rounded-full", className)}>
        <div className="size-10 rounded-full bg-secondary dark:bg-[#333334] animate-pulse" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton>
        <Button variant="outline">
          <LogIn />
          Sign in
        </Button>
      </SignInButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="outline-none focus:outline-none">
        <button
          className={cn("flex-none rounded-full cursor-pointer", className)}
        >
          <UserAvatar avatarUrl={currentUser?.imageUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          Logged in as @{currentUser?.firstName} {""} {currentUser?.lastName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/users/${currentUser?._id}`}>
          <DropdownMenuItem>
            <UserIcon className="size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="size-4" />
                System default
                {theme === "system" && <Check className="size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="size-4" />
                Light
                {theme === "light" && <Check className="size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="size-4" />
                Dark
                {theme === "dark" && <Check className="size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <Separator className="my-1" />
        <DropdownMenuItem onClick={() => handleSignout()}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
