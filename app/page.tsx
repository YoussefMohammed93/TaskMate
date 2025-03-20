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
    </main>
  );
}
