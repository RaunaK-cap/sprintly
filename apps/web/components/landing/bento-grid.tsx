"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Check, ArrowRight } from "lucide-react";

function BentoCell({ 
  title, 
  description, 
  className,
  children,
  delay = 0 
}: { 
  title: string; 
  description: string; 
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={`bg-white border border-border flex flex-col group ${className}`}
    >
      <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-hidden bg-[#FAF9F6] relative">
        {children}
      </div>
      <div className="p-5 border-t border-border bg-white">
        <h3 className="text-[15px] font-medium text-foreground tracking-tight mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function BentoGrid() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-[1280px] mx-auto" id="product">
      <div className="mb-12">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground tracking-tight mb-3">
          Everything you need, nothing you don&apos;t.
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Purpose-built tools to manage your workflow with zero noise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[340px]">
        
        {/* Large cell: Infinite Boards (Monochrome minimalist board) */}
        <BentoCell 
          title="Infinite Boards" 
          description="Drag, drop, and organize your work effortlessly across teams."
          className="md:col-span-2 md:row-span-2"
          delay={0}
        >
          <div className="w-full h-full pt-4 flex gap-3 items-start overflow-hidden">
            
            {/* Column 1: Backlog */}
            <div className="flex-1 bg-[#F2F1EC] border border-border p-3 rounded-[2px] flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Backlog</span>
                <span className="text-[10px] font-mono text-muted-foreground">2</span>
              </div>

              <div className="bg-white border border-border p-2.5 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-1.5">
                <span className="text-[12.5px] font-medium text-foreground leading-snug">Design system audit</span>
                <span className="text-[10px] font-mono text-muted-foreground/70">#102 · Core</span>
              </div>

              <div className="bg-white border border-border p-2.5 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-1.5">
                <span className="text-[12.5px] font-medium text-foreground leading-snug">Prisma migrations</span>
                <span className="text-[10px] font-mono text-muted-foreground/70">#103 · API</span>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="flex-1 bg-[#F2F1EC] border border-border p-3 rounded-[2px] flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-mono text-foreground font-medium uppercase tracking-wider">In Progress</span>
                <span className="text-[10px] font-mono text-muted-foreground">1</span>
              </div>

              <div className="bg-white border border-foreground/30 p-2.5 rounded-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-1.5">
                <span className="text-[12.5px] font-medium text-foreground leading-snug">WebSocket engine</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground/70">#104 · Realtime</span>
                  <div className="size-4 rounded-full bg-foreground text-background flex items-center justify-center text-[8px] font-mono">RK</div>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="flex-1 bg-[#F2F1EC] border border-border p-3 rounded-[2px] flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Done</span>
                <span className="text-[10px] font-mono text-muted-foreground">2</span>
              </div>

              <div className="bg-white/80 border border-border/70 p-2.5 rounded-[2px] flex flex-col gap-1.5 opacity-60">
                <span className="text-[12.5px] text-muted-foreground line-through leading-snug">Org switcher</span>
                <span className="text-[10px] font-mono text-muted-foreground/50">#98 · Shipped</span>
              </div>

              <div className="bg-white/80 border border-border/70 p-2.5 rounded-[2px] flex flex-col gap-1.5 opacity-60">
                <span className="text-[12.5px] text-muted-foreground line-through leading-snug">Auth sessions</span>
                <span className="text-[10px] font-mono text-muted-foreground/50">#99 · Shipped</span>
              </div>
            </div>

          </div>
        </BentoCell>

        {/* Small cell: Nested Checklists */}
        <BentoCell 
          title="Nested Checklists" 
          description="Break complex milestones down into actionable sub-tasks."
          delay={0.1}
        >
          <div className="w-full max-w-[220px] bg-white border border-border p-3.5 flex flex-col gap-2.5 rounded-[2px] shadow-sm">
            <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border">
              Sprint 1.4 Checklist
            </div>
            
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded-[2px] bg-foreground text-background flex items-center justify-center shrink-0">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span className="text-[12px] text-foreground font-normal">Database indexes</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded-[2px] bg-foreground text-background flex items-center justify-center shrink-0">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span className="text-[12px] text-foreground font-normal">E2E test suite</span>
            </div>

            <div className="flex items-center gap-2 opacity-50">
              <div className="size-3.5 rounded-[2px] border border-border bg-background shrink-0" />
              <span className="text-[12px] text-muted-foreground">Production deploy</span>
            </div>
          </div>
        </BentoCell>

        {/* Small cell: Automation */}
        <BentoCell 
          title="Workflow Rules" 
          description="Automate repetitive handoffs with intuitive trigger chains."
          delay={0.2}
        >
          <div className="w-full max-w-[220px] flex flex-col gap-2 items-center">
            <div className="w-full bg-white border border-border p-2 rounded-[2px] shadow-sm flex items-center gap-2 font-mono text-[11px]">
              <span className="text-muted-foreground uppercase">IF</span>
              <span className="text-foreground truncate">Card → &quot;Done&quot;</span>
            </div>

            <ArrowRight className="size-3 text-muted-foreground rotate-90" />

            <div className="w-full bg-white border border-border p-2 rounded-[2px] shadow-sm flex items-center gap-2 font-mono text-[11px]">
              <span className="text-muted-foreground uppercase">THEN</span>
              <span className="text-foreground truncate">Notify #releases</span>
            </div>
          </div>
        </BentoCell>

        {/* Medium cell: Connected Stack */}
        <BentoCell 
          title="Connected Stack" 
          description="Sync seamlessly with your codebase, design tools, and terminal."
          className="md:col-span-2"
          delay={0.1}
        >
          <div className="w-full max-w-[460px] grid grid-cols-3 gap-2.5">
            <div className="bg-white border border-border p-3 rounded-[2px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[12px] font-medium text-foreground">GitHub</span>
              <span className="text-[11px] text-muted-foreground">Auto-link PRs</span>
            </div>

            <div className="bg-white border border-border p-3 rounded-[2px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[12px] font-medium text-foreground">Figma</span>
              <span className="text-[11px] text-muted-foreground">Frame embeds</span>
            </div>

            <div className="bg-white border border-border p-3 rounded-[2px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[12px] font-medium text-foreground">Webhooks</span>
              <span className="text-[11px] text-muted-foreground">REST triggers</span>
            </div>
          </div>
        </BentoCell>

        {/* Medium cell: Activity Streams */}
        <BentoCell 
          title="Activity Streams" 
          description="A quiet, real-time log of every board update."
          delay={0.2}
        >
          <div className="w-full max-w-[220px] flex flex-col gap-2">
            <div className="bg-white border border-border p-2.5 rounded-[2px] shadow-sm flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">Sarah J.</span>
                <span>2m</span>
              </div>
              <p className="text-[11.5px] text-muted-foreground leading-snug">
                Moved <span className="text-foreground font-medium">#104</span> to Done
              </p>
            </div>

            <div className="bg-white border border-border p-2.5 rounded-[2px] shadow-sm flex flex-col gap-1 opacity-50">
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">Alex R.</span>
                <span>14m</span>
              </div>
              <p className="text-[11.5px] text-muted-foreground leading-snug">
                Updated description
              </p>
            </div>
          </div>
        </BentoCell>

      </div>
    </section>
  );
}
