import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Sprintly — All your team's work, one calm board",
  description:
    "Sprintly brings your tasks, teammates, and tools together on boards that update in real time — so nothing slips and no one chases status.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("font-sans", GeistSans.variable, GeistMono.variable)}
    >
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
