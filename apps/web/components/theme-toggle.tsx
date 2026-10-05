"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "size-9 rounded-none text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Sun className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
