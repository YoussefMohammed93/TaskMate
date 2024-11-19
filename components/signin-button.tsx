import { signIn } from "@/auth";
import { Button } from "./ui/button";

export const SignInButton = () => {
  return (
    <form
      action={async () => {
        "use server";

        await signIn("github");
      }}
    >
      <Button type="submit">
        <span>Login</span>
      </Button>
    </form>
  );
};
