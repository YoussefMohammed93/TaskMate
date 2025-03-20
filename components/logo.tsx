import Link from "next/link";
import { Protest_Revolution } from "next/font/google";

const LogoFont = Protest_Revolution({
  weight: "400",
  subsets: ["latin"],
});

export const Logo = () => {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 text-2xl md:text-3xl font-bold text-primary dark:text-white ${LogoFont.className}`}
      aria-label="TaskMate"
    >
      <svg width="200" height="50" className="fill-current">
        <text x="0" y="40" fontSize="40">
          TaskMate
        </text>
      </svg>
    </Link>
  );
};
