"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import MainPage from "./components/MainPage";
import MarktingPage from "./components/MarktingPage";

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
      <div className="w-full h-[90vh] flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {!session ? <MarktingPage /> : <MainPage session={session} />}
    </div>
  );
}
