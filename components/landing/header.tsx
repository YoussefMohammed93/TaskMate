import { Logo } from "../logo";
import UserButton from "../user-button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card border-b">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 px-6 py-1.5 sm:gap-5">
        <Logo />
        <UserButton />
      </div>
    </header>
  );
};
