"use client";

import * as React from "react";
import Link from "next/link";
import { useScroll, useTransform, motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { scrollY } = useScroll();
  
  // Transition background from transparent to solid after 80px scroll
  const background = useTransform(
    scrollY,
    [0, 80],
    ["rgba(246, 245, 241, 0)", "rgba(246, 245, 241, 1)"]
  );
  
  const borderBottom = useTransform(
    scrollY,
    [0, 80],
    ["1px solid rgba(222, 219, 210, 0)", "1px solid rgba(222, 219, 210, 1)"]
  );

  return (
    <motion.header
      style={{ background, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Simple geometric mark */}
          <div className="size-6 bg-foreground rounded-[2px]" />
          <span className="font-sans font-medium text-lg tracking-tight">Sprintly</span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Product
          </Link>
          <Link href="#templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link href="#resources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Resources
          </Link>
          <Link href="#company" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Company
          </Link>
        </nav>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-muted-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="rounded-none">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

