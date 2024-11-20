import { signIn } from "@/auth";
import { Button } from "./ui/button";
import { Github } from "lucide-react";

export const SignInButton = () => {
  return (
    <form
      action={async () => {
        "use server";

        await signIn("github");
      }}
    >
      <Button type="submit" variant="default">
        <span>Login with github</span>
        <Github className="size-5" />
      </Button>
    </form>
  );
};
