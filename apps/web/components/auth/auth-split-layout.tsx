import * as React from "react";
import Link from "next/link";
import { Hexagon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  headerLinkText: string;
  headerLinkHref: string;
}

export function AuthSplitLayout({
  children,
  headerLinkText,
  headerLinkHref,
}: AuthSplitLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel (Form side) */}
      <div className="relative flex w-full flex-col lg:w-[45%]">
        {/* Header */}
        <header className="flex h-20 w-full items-center justify-between px-8 pt-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-none bg-foreground">
              <Hexagon className="size-4 text-background fill-background" />
            </div>
            <span className="font-sans font-medium text-lg tracking-tight">Sprintly</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-none shrink-0"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link href={headerLinkHref} className="text-[14px] font-medium hover:text-muted-foreground transition-colors">
              {headerLinkText}
            </Link>
          </div>
        </header>

        {/* Form Container (Centered horizontally in the column) */}
        <div className="flex flex-1 flex-col px-8 pt-[12vh] items-center">
          <div className="w-full max-w-[360px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex w-full items-center justify-between px-8 pb-8 mt-auto text-[12px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Sprintly</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </footer>
      </div>

      {/* Right panel (Image/Texture side) */}
      <div className="relative hidden overflow-hidden border-l border-border lg:block lg:w-[55%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/authbg.png"
          alt="Sprintly"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Blend the image into the form side and theme surface */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background/85 via-background/40 to-transparent" />
        <div className="absolute bottom-8 left-8 flex flex-col gap-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/80">
            Sprintly — move work forward
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-foreground/70">
            One calm board for your tasks, teammates, and tools.
          </p>
        </div>
      </div>
    </div>
  );
}
