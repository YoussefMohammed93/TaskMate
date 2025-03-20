"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Main() {
  return (
    <main className="p-5">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <Button
        className="m-10"
        onClick={() => {
          alert("Hello!");
        }}
      >
        Click Me
      </Button>
    </main>
  );
}
