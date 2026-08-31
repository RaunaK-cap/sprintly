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
            <div className="flex items-center justify-center size-7 bg-foreground rounded-[4px]">
              <Hexagon className="size-4 text-background fill-background" />
            </div>
            <span className="font-sans font-medium text-lg tracking-tight">Sprintly</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-sm shrink-0"
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
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-bg-inverted">
        {/* Optional decorative content */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1600573472591-ee6981cf35b6?q=80&w=2000&auto=format&fit=crop" 
            alt="" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]" />
        </div>
        {/* Gradient overlay to ensure it blends nicely and stays premium */}
        <div className="absolute inset-0 bg-gradient-to-tr from-bg-inverted/60 to-transparent" />
      </div>
    </div>
  );
}
