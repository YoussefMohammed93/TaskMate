"use client";

import { UserProfile } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Settings() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-xl font-light">
          Manage your account settings and preferences
        </p>
      </div>
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none border bg-muted dark:bg-muted/20",
            card: "dark:bg-muted/20",
            navbar: "dark:!bg-muted/20 dark:border-b dark:border-muted/30",
            pageScrollBox: "dark:bg-muted/20",
            formButtonPrimary: "dark:bg-primary",
            formButtonReset: "dark:bg-muted/50",
            formFieldInput: "dark:bg-muted/50",
            formFieldInputGroup: "dark:bg-muted/50",
            formFieldRow: "dark:bg-transparent",
            page: "dark:bg-transparent",
          },
        }}
      />
    </div>
  );
}
