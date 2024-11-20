"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import MarktingPage from "./components/MarktingPage";
import MainPage from "./components/MainPage";

interface MainClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

export default function MainClient({ session }: MainClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session !== undefined) {
      setIsLoading(false);
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center">
        <Loader2 className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div>{!session ? <MarktingPage /> : <MainPage session={session} />}</div>
  );
}
