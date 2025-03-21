import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./convex-client-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "TaskMate - Your Personal Productivity Companion",
    template: "%s | TaskMate",
  },
  description:
    "Transform your daily workflow with TaskMate. Seamlessly manage tasks, boost focus with Pomodoro sessions, and organize thoughts with digital sticky notes — all in one elegant workspace.",
  keywords: [
    "productivity",
    "task management",
    "pomodoro timer",
    "sticky notes",
    "workflow organization",
    "time management",
  ],
  authors: [{ name: "Youssef Mohammed" }],
  creator: "TaskMate",
  publisher: "TaskMate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            enableSystem
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <EdgeStoreProvider>{children}</EdgeStoreProvider>
              <Toaster position="bottom-right" richColors />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
