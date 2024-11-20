import { signOut } from "@/auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export const LogOutButton = () => {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({ redirectTo: "/" });
      }}
    >
      <Button type="submit">
        <span>Logout</span>
        <LogOut className="size-5" />
      </Button>
    </form>
  );
};
