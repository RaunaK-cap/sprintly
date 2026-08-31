import * as React from "react";
import Link from "next/link";
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

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
          <Link href={headerLinkHref} className="text-[14px] font-medium hover:text-muted-foreground transition-colors">
            {headerLinkText}
          </Link>
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
        {/* Elegant Abstract Architecture / Texture Image */}
        <img 
          src="https://images.unsplash.com/photo-1600573472591-ee6981cf35b6?q=80&w=2000&auto=format&fit=crop" 
          alt="Abstract architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Gradient overlay to ensure it blends nicely and stays premium */}
        <div className="absolute inset-0 bg-gradient-to-tr from-bg-inverted/60 to-transparent" />
      </div>
    </div>
  );
}

