import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export const LogOutButton = () => {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="flex gap-x-2">
        <LogOut className="size-4" />
        <span>Logout</span>
      </button>
    </form>
  );
};
