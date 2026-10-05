"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Command, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUERY = "Mark #212 complete";

function CommandPalette({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [chars, setChars] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion) {
      setChars(QUERY.length);
      setShowResult(true);
      return;
    }
    let timeout: number;
    if (chars < QUERY.length) {
      timeout = window.setTimeout(() => setChars((c) => c + 1), 85);
    } else if (!showResult) {
      timeout = window.setTimeout(() => setShowResult(true), 400);
    } else {
      timeout = window.setTimeout(() => {
        setChars(0);
        setShowResult(false);
      }, 2400);
    }
    return () => window.clearTimeout(timeout);
  }, [chars, showResult, active, prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={active ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-1/2 top-6 z-20 w-[300px] -translate-x-1/2 sm:w-[340px]"
    >
      <div className="overflow-hidden rounded-none border border-border bg-card shadow-xl shadow-foreground/10">
        <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-[12.5px]">
            {QUERY.slice(0, chars)}
            {!showResult && chars < QUERY.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-foreground"
              />
            )}
          </span>
          <span className="flex items-center gap-0.5 rounded-none border border-border px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
            <Command className="size-2" />K
          </span>
        </div>
        <div className="p-1.5">
          <div
            className={cn(
              "flex items-center justify-between rounded-none px-2.5 py-2 transition-colors duration-200",
              showResult ? "bg-foreground/10" : "bg-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">#212</span>
              <span className="text-[12px] font-medium">Move to Done</span>
            </div>
            <Check
              className={cn(
                "size-3.5 text-foreground transition-opacity duration-200",
                showResult ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
          <div className="flex items-center gap-2 rounded-none px-2.5 py-2">
            <span className="font-mono text-[10px] text-muted-foreground">#208</span>
            <span className="text-[12px] text-muted-foreground">Assign to Leo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductDepth() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="showcase" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Showcase
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Designed for velocity.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Stop fighting your tools. Sprintly gets out of your way so you can
              focus on shipping — keyboard-first navigation, instant sync, zero clutter.
            </p>
            <ul className="mt-7 flex flex-col gap-3.5">
              {[
                "Command palette for everything",
                "Real-time multiplayer presence",
                "Sub-50 ms optimistic interactions",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-foreground/10">
                    <Check className="size-3 text-foreground" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-8 rounded-none bg-card hover:bg-card"
              nativeButton={false}
              render={<a href="#features" />}
            >
              Explore features
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          {/* Product window */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-8"
          >
            <div className="relative flex min-h-[440px] items-center justify-center rounded-none border border-border bg-muted/30 p-4 md:p-8">
              <CommandPalette active={inView} />

              <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-none border border-border bg-card shadow-sm">
                {/* Window header */}
                <div className="flex h-10 items-center justify-between border-b border-border bg-background/60 px-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-border" />
                      <span className="size-2.5 rounded-full bg-border" />
                      <span className="size-2.5 rounded-full bg-border" />
                    </div>
                    <span className="hidden font-mono text-[10.5px] text-muted-foreground sm:block">
                      sprintly.app / acme / core-sprint
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-none border border-border bg-card px-2 py-1 font-mono text-[9.5px] text-muted-foreground shadow-xs">
                    <Search className="size-2.5" />
                    Quick jump…
                  </div>
                </div>

                <div className="flex overflow-hidden">
                  {/* Sidebar */}
                  <div className="hidden w-44 shrink-0 flex-col gap-3 border-r border-border bg-background/40 p-3 sm:flex">
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
                      Active boards
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between rounded-none border border-border bg-card px-2 py-1.5 text-[12px] font-medium shadow-xs">
                        <span className="truncate">Core Sprint 12</span>
                        <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      </div>
                      <div className="px-2 py-1.5 text-[12px] text-muted-foreground">
                        Design Tokens
                      </div>
                      <div className="px-2 py-1.5 text-[12px] text-muted-foreground">
                        API Integrations
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2 border-t border-border pt-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-[8px] font-semibold text-background">
                        RK
                      </div>
                      <span className="truncate text-[11px] font-medium">Raunak K.</span>
                    </div>
                  </div>

                  {/* Issue panel */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[13px] font-semibold">
                          #104 · WebSocket presence engine
                        </span>
                        <span className="shrink-0 rounded-none border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] uppercase">
                          In progress
                        </span>
                      </div>
                      <div className="flex shrink-0 -space-x-1">
                        <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-[8px] font-semibold text-background ring-2 ring-card">
                          RK
                        </div>
                        <div className="flex size-5 items-center justify-center rounded-full bg-muted-foreground text-[8px] font-semibold text-background ring-2 ring-card">
                          SJ
                        </div>
                      </div>
                    </div>

                    <div className="rounded-none border border-border bg-background/60 p-3">
                      <p className="text-[12px] leading-relaxed text-foreground/90">
                        Optimize real-time card transitions with optimistic updates
                        and room broadcast listeners.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-2 font-mono text-[10px] text-muted-foreground">
                        <span>
                          Priority: <strong className="font-medium text-foreground">High</strong>
                        </span>
                        <span>
                          Assignee: <strong className="font-medium text-foreground">Raunak</strong>
                        </span>
                        <span>
                          Sprint: <strong className="font-medium text-foreground">v1.2</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
                        Acceptance criteria
                      </span>
                      {[
                        { label: "Multi-tab session isolation", done: true },
                        { label: "3-second polling fallback sync", done: true },
                        { label: "Cross-organization room isolation", done: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-[12px]">
                          <span
                            className={cn(
                              "flex size-3.5 shrink-0 items-center justify-center rounded-none border",
                              item.done ? "border-foreground bg-foreground" : "border-border bg-card"
                            )}
                          >
                            {item.done && <Check className="size-2.5 stroke-[3] text-background" />}
                          </span>
                          <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
