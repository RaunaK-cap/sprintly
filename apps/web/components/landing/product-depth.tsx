"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";

export function ProductDepth() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 md:px-8 max-w-[1280px] mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-4">
          <h2 className="text-[28px] md:text-[32px] font-semibold text-ink mb-4 leading-tight">
            Designed for velocity.
          </h2>
          <p className="text-[16px] text-muted-foreground mb-8">
            Stop fighting your tools. Sprintly's interface gets out of your way so you can focus on shipping. Keyboard-first navigation, instant sync, and zero clutter.
          </p>
          <ul className="flex flex-col gap-4 mb-8">
            {["Command palette for everything", "Real-time multiplayer", "Sub-50ms interactions"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[15px] text-ink-muted">
                <div className="size-1.5 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="rounded-none">
            View Documentation
          </Button>
        </div>

        <motion.div 
          ref={ref}
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-8 bg-muted/20 border border-border p-4 md:p-8 flex items-center justify-center relative min-h-[400px]"
        >
          {/* Abstract deep dive UI */}
          <div className="w-full max-w-2xl bg-white border border-border shadow-sm flex flex-col h-[380px]">
            {/* Header */}
            <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-muted/10">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-border" />
                <div className="size-3 rounded-full bg-border" />
                <div className="size-3 rounded-full bg-border" />
              </div>
              <div className="h-4 w-32 bg-border/50 rounded-sm" />
            </div>
            {/* Body */}
            <div className="flex-1 p-4 flex gap-4 overflow-hidden">
               <div className="w-1/4 h-full border-r border-border/50 flex flex-col gap-2 pr-4">
                  <div className="h-3 w-1/2 bg-muted-foreground/20 mb-4" />
                  <div className="h-8 bg-muted/50 border border-border/50" />
                  <div className="h-8 bg-muted/50 border border-border/50" />
                  <div className="h-8 bg-white border border-border shadow-sm" />
               </div>
               <div className="flex-1 flex flex-col gap-4">
                  <div className="h-6 w-1/3 bg-ink/10 mb-2" />
                  <div className="h-32 bg-white border border-border shadow-sm w-full" />
                  <div className="flex gap-4">
                     <div className="h-20 bg-muted/30 border border-border/50 flex-1" />
                     <div className="h-20 bg-muted/30 border border-border/50 flex-1" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

