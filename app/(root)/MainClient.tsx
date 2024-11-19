"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
    <div>
      {!session ? (
        <div className="p-5">
          <h1>Welcome to Our Website</h1>
          <p>Please log in to access more features.</p>
        </div>
      ) : (
        <div className="p-5">
          <h1>Welcome, {session.user?.name}!</h1>
          <p>You are logged in. Here’s your main content.</p>
        </div>
      )}
    </div>
  );
}
