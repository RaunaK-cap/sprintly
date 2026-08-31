"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MiniBoard() {
  const [activeColumn, setActiveColumn] = React.useState<"todo" | "doing" | "done">("todo");

  React.useEffect(() => {
    // Auto-animate a card moving between columns
    const interval = setInterval(() => {
      setActiveColumn((prev) => {
        if (prev === "todo") return "doing";
        if (prev === "doing") return "done";
        return "todo";
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md bg-white border border-border p-4 shadow-sm flex gap-3 h-[300px]">
      {/* Todo Column */}
      <div className="flex-1 bg-muted/30 p-2 border border-border/50 flex flex-col gap-2">
        <h3 className="text-[13px] font-medium text-ink-muted">To do</h3>
        {activeColumn === "todo" && (
          <motion.div
            layoutId="demo-card"
            className="bg-white border border-border p-3 shadow-sm cursor-grab active:cursor-grabbing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="h-2 w-8 bg-accent/20 rounded-full mb-2" />
            <div className="text-[13px] font-medium">Finalize landing page PRD</div>
          </motion.div>
        )}
        <div className="bg-white/50 border border-border/30 p-3 shadow-sm">
          <div className="h-2 w-6 bg-muted rounded-full mb-2" />
          <div className="text-[13px] text-ink-muted">Update auth logic</div>
        </div>
      </div>

      {/* Doing Column */}
      <div className="flex-1 bg-muted/30 p-2 border border-border/50 flex flex-col gap-2">
        <h3 className="text-[13px] font-medium text-ink-muted">In progress</h3>
        {activeColumn === "doing" && (
          <motion.div
            layoutId="demo-card"
            className="bg-white border border-border p-3 shadow-sm cursor-grab active:cursor-grabbing"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="h-2 w-8 bg-accent/20 rounded-full mb-2" />
            <div className="text-[13px] font-medium">Finalize landing page PRD</div>
          </motion.div>
        )}
      </div>

      {/* Done Column */}
      <div className="flex-1 bg-muted/30 p-2 border border-border/50 flex flex-col gap-2">
        <h3 className="text-[13px] font-medium text-ink-muted">Done</h3>
        {activeColumn === "done" && (
          <motion.div
            layoutId="demo-card"
            className="bg-white border border-border p-3 shadow-sm cursor-grab active:cursor-grabbing"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="h-2 w-8 bg-accent/20 rounded-full mb-2" />
            <div className="text-[13px] font-medium line-through text-ink-muted">Finalize landing page PRD</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-8 max-w-[1280px] mx-auto relative overflow-hidden">
      {/* Optional faint background texture/lines could go here */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--line) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Copy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-xl"
        >
          <h1 className="text-4xl md:text-[52px] font-semibold leading-[1.08] tracking-tight text-ink mb-6">
            Move work forward, <br />without the noise.
          </h1>
          <p className="text-[15px] md:text-[16px] text-muted-foreground leading-[1.55] mb-8 max-w-[480px]">
            Sprintly is a quiet, considered workspace for modern teams. Organize boards, automate workflows, and focus on what actually matters.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="rounded-none px-8">
                Start free
              </Button>
            </Link>
            <a href="#demo" className="text-[15px] font-medium text-foreground hover:text-primary transition-colors">
              See how it works &rarr;
            </a>
          </div>
        </motion.div>

        {/* Right Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex lg:justify-end"
        >
          <MiniBoard />
        </motion.div>
      </div>
    </section>
  );
}

