"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, Search, Command } from "lucide-react";

export function ProductDepth() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 md:px-8 max-w-[1280px] mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left text column */}
        <div className="lg:col-span-4">
          <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-4 leading-tight tracking-tight">
            Designed for velocity.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
            Stop fighting your tools. Sprintly&apos;s interface gets out of your way so you can focus on shipping. Keyboard-first navigation, instant sync, and zero clutter.
          </p>
          <ul className="flex flex-col gap-3.5 mb-8">
            {[
              "Command palette for everything",
              "Real-time multiplayer presence",
              "Sub-50ms optimistic interactions"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[14px] text-foreground">
                <span className="size-1.5 bg-primary rounded-full shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="rounded-[2px] h-10 px-5 text-[13px] font-medium border-border">
            View Documentation
          </Button>
        </div>

        {/* Right Product Mockup Window */}
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-8 bg-[#FAF9F5] border border-border p-4 md:p-6 flex items-center justify-center relative min-h-[420px]"
        >
          {/* App Window */}
          <div className="w-full max-w-2xl bg-white border border-border shadow-sm flex flex-col rounded-[3px] overflow-hidden">
            
            {/* Window Header */}
            <div className="h-10 border-b border-border flex items-center justify-between px-3.5 bg-[#FAF9F6]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-border" />
                  <div className="size-2.5 rounded-full bg-border" />
                  <div className="size-2.5 rounded-full bg-border" />
                </div>
                <div className="h-3 w-px bg-border/80 mx-1" />
                <span className="text-[11px] font-mono text-muted-foreground">sprintly.app / acme / core-sprint</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-border px-2 py-1 rounded-[2px] text-[10px] font-mono text-muted-foreground shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
                <Search className="size-2.5" />
                <span>Quick jump...</span>
                <span className="flex items-center text-[9px] bg-muted/50 px-1 rounded border border-border/40 ml-1">
                  <Command className="size-2 mr-0.5" />K
                </span>
              </div>
            </div>

            {/* Window Body */}
            <div className="flex-1 flex overflow-hidden min-h-[320px]">
              
              {/* Left Mini Sidebar */}
              <div className="w-44 border-r border-border p-3 flex flex-col gap-3 bg-[#FCFCFA] shrink-0">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Active Boards
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-[2px] bg-foreground/5 border border-foreground/10 text-[12px] font-medium text-foreground">
                    <span className="truncate">Core Sprint 12</span>
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>

                  <div className="px-2 py-1.5 rounded-[2px] text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    <span>Design Tokens</span>
                  </div>

                  <div className="px-2 py-1.5 rounded-[2px] text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    <span>API Integrations</span>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-border flex items-center gap-2">
                  <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center text-[9px] font-mono font-bold">
                    RK
                  </div>
                  <span className="text-[11px] font-medium text-foreground truncate">Raunak K.</span>
                </div>
              </div>

              {/* Right Work Area */}
              <div className="flex-1 p-4 flex flex-col gap-3 bg-white">
                
                {/* Board Subheader */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">#104 · WebSocket presence engine</span>
                    <span className="text-[10px] font-mono bg-muted/60 text-foreground px-1.5 py-0.5 rounded border border-border">IN PROGRESS</span>
                  </div>
                  <div className="flex -space-x-1">
                    <div className="size-5 rounded-full bg-foreground text-background border border-white flex items-center justify-center text-[8px] font-mono font-bold">RK</div>
                    <div className="size-5 rounded-full bg-muted text-foreground border border-white flex items-center justify-center text-[8px] font-mono font-bold">SJ</div>
                  </div>
                </div>

                {/* Issue Details Box */}
                <div className="border border-border p-3 rounded-[2px] bg-[#FAF9F6] flex flex-col gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="text-[12px] text-foreground leading-relaxed">
                    Optimize real-time card transitions with optimistic updates and room broadcast listeners.
                  </div>
                  
                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                    <span>Priority: <strong className="text-foreground font-medium">High</strong></span>
                    <span>Assignee: <strong className="text-foreground font-medium">Raunak</strong></span>
                    <span>Sprint: <strong className="text-foreground font-medium">v1.2</strong></span>
                  </div>
                </div>

                {/* Acceptance Criteria Sub-tasks */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Acceptance Criteria</span>
                  
                  <div className="flex items-center gap-2 text-[12px] text-foreground">
                    <div className="size-3.5 rounded-[2px] bg-foreground text-background flex items-center justify-center">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span>Multi-tab session isolation via sessionStorage</span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-foreground">
                    <div className="size-3.5 rounded-[2px] bg-foreground text-background flex items-center justify-center">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span>3-second polling fallback sync</span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <div className="size-3.5 rounded-[2px] border border-border bg-background" />
                    <span>Cross-organization room isolation</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
