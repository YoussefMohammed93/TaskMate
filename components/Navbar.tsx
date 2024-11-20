import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";
import { LogOutButton } from "./logout-button";
import { SignInButton } from "./signin-button";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className="px-5 py-1 border-b shadow-sm">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-x-2">
          <div className="w-12 h-12 relative">
            <Image src="/logo.svg" alt="Logo" loading="eager" fill />
          </div>
          <span className="text-xl font-semibold">Taskmate</span>
        </Link>
        <div className="flex items-center gap-x-5">
          {session && session?.user ? (
            <div className="flex items-center gap-x-2">
              <LogOutButton />
              <div>
                <Image
                  src={session?.user?.image || "/avatar.png"}
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
