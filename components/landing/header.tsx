import { Logo } from "../logo";
import UserButton from "../user-button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card dark:bg-secondary border-b">
      <div className="max-w-[1260px] mx-auto flex items-center justify-between gap-5 px-5 py-1.5">
        <Logo />
        <UserButton />
      </div>
    </header>
  );
};
