import { signOut } from "@/auth";
import { Button } from "./ui/button";

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
      </Button>
    </form>
  );
};
