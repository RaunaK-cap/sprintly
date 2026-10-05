"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Hexagon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Why Sprintly", href: "#compare" },
];

export function Navigation() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 16));

  // The header floats over the hero sky until scrolled — invert to white there.
  const onSky = !scrolled && !menuOpen;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border bg-background/50 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-none",
              onSky ? "bg-white" : "bg-foreground"
            )}
          >
            <Hexagon
              className={cn(
                "size-4",
                onSky ? "fill-neutral-950 text-neutral-950" : "fill-background text-background"
              )}
            />
          </div>
          <span
            className={cn(
              "text-lg font-medium tracking-tight",
              onSky ? "text-white" : "text-foreground"
            )}
          >
            Sprintly
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                onSky
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className={onSky ? "text-white/80 hover:bg-white/10 hover:text-white" : undefined} />
          <Link
            href="/login"
            className={cn(
              "hidden px-3 text-sm font-medium transition-colors sm:block",
              onSky
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign in
          </Link>
          <Button
            className={cn(
              "hidden rounded-none sm:inline-flex",
              onSky
                ? "bg-white text-neutral-950 hover:bg-white"
                : "bg-foreground text-background hover:bg-foreground"
            )}
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            Get started
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn("md:hidden", onSky && "text-white hover:bg-white/10 hover:text-white")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button
                className="mt-3 rounded-none bg-foreground text-background hover:bg-foreground"
                nativeButton={false}
                render={<Link href="/signup" />}
                onClick={() => setMenuOpen(false)}
              >
                Get started
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
