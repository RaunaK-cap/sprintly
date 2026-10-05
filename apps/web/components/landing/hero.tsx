"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Command, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { CloudShader } from "@/components/ui/cloud-shader";
import { cn } from "@/lib/utils";

const COLUMNS = ["Backlog", "In progress", "Done"] as const;

/* Theme-aware cloud palettes — soft daylight sky in light, ink sky in dark. */
const SHADER_PALETTES = {
  light: {
    skyTopColor: "#3D74B6",
    skyBottomColor: "#A3C9EC",
    cloudColor: "#FBF9F4",
  },
  dark: {
    skyTopColor: "#141311",
    skyBottomColor: "#23201B",
    cloudColor: "#5E5749",
  },
} as const;

const TICKER = [
  "Maya moved #212 Redesign onboarding",
  "Leo commented on #208 API rate limits",
  "Maya completed #212 Redesign onboarding",
];

const COUNTS = [3, 2, 3];

const AVATARS = [
  { initials: "MK", className: "bg-foreground" },
  { initials: "LR", className: "bg-foreground/70" },
  { initials: "AJ", className: "bg-muted-foreground" },
  { initials: "+6", className: "bg-white/25 text-white" },
];

function MovingCard() {
  return (
    <motion.div
      layoutId="hero-active-card"
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="cursor-grab rounded-none border border-border bg-card p-3 shadow-md shadow-foreground/5 active:cursor-grabbing"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-none bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Design
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">#212</span>
      </div>
      <p className="text-[13px] font-medium leading-snug">Redesign onboarding flow</p>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-[8px] font-semibold text-background">
          MK
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">3/5 tasks</span>
      </div>
    </motion.div>
  );
}

function StaticCard({
  id,
  title,
  tag,
  dim = false,
}: {
  id: string;
  title: string;
  tag: string;
  dim?: boolean;
}) {
  return (
    <div className={cn("rounded-none border border-border/70 bg-card p-2.5", dim && "opacity-55")}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="rounded-none bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
          {tag}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/70">{id}</span>
      </div>
      <p className={cn("text-[12px] font-medium leading-snug", dim && "text-muted-foreground line-through")}>
        {title}
      </p>
    </div>
  );
}

function FrameMarkers() {
  const base = "absolute size-3 rounded-none border border-foreground/25 bg-background";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className={cn(base, "-left-1.5 -top-1.5")} />
      <span className={cn(base, "-right-1.5 -top-1.5")} />
      <span className={cn(base, "-bottom-1.5 -left-1.5")} />
      <span className={cn(base, "-bottom-1.5 -right-1.5")} />
    </div>
  );
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const palette =
    resolvedTheme === "dark" ? SHADER_PALETTES.dark : SHADER_PALETTES.light;
  const boardRef = React.useRef<HTMLDivElement>(null);
  const boardInView = useInView(boardRef, { amount: 0.2 });
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    if (!boardInView || prefersReducedMotion) return;
    const id = setInterval(() => setStage((s) => (s + 1) % COLUMNS.length), 3000);
    return () => clearInterval(id);
  }, [boardInView, prefersReducedMotion]);

  return (
    <section className="relative isolate overflow-hidden pt-32 md:pt-44">
      {/* Backdrop: live cloud shader, fading into the page below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_58%,transparent_94%)]"
      >
        <CloudShader
          className="absolute inset-0 min-h-0 w-full dark:opacity-90"
          speed={0.85}
          count={5}
          skyTopColor={palette.skyTopColor}
          skyBottomColor={palette.skyBottomColor}
          cloudColor={palette.cloudColor}
        />
        {/* Quiet scrim so the copy stays readable when clouds drift behind it */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,rgba(19,42,74,0.5),transparent_74%)] dark:bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,rgba(0,0,0,0.55),transparent_74%)]" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        {/* Copy — sits on the sky, so it stays light in both themes */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >

          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-white [text-shadow:0_2px_28px_rgba(10,28,52,0.4)] md:text-7xl"
          >
            <span className="block font-mono text-6xl">All your team&rsquo;s work,</span>
            <span className="block font-mono text-6xl">
              one <span className="text-black dark:text-white">calm</span> board.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed font-mono text-white/80 [text-shadow:0_1px_14px_rgba(10,28,52,0.35)] md:text-md"
          >
            Sprintly brings your tasks, teammates, and tools together on boards
            that update in real time — so nothing slips and no one chases status.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              size="default"
              className="h-10 px-7 text-sm font-mono bg-white text-black rounded-none font-normal hover:bg-white"
              variant={"secondary"}
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Start free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              className="h-10 px-7 text-sm border border-white/40 bg-white/20  text-white shadow-xs backdrop-blur-md hover:bg-white/20 hover:text-white rounded-none font-normal font-mono"
              nativeButton={false}
              render={<Link href="#showcase" />}
            >
              See how it works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.initials}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-white/60 text-[9px] font-semibold text-white",
                    avatar.className
                  )}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-white/90 text-white/90" />
                ))}
              </div>
              <span className="text-xs text-white/75 [text-shadow:0_1px_10px_rgba(10,28,52,0.35)]">
                Loved by 2,000+ teams
              </span>
            </div>
          </motion.div>
        </div>

        {/* Product mockup */}
        <div
          ref={boardRef}
          className="relative mx-auto mt-16 max-w-[1040px] [perspective:1600px] md:mt-24"
        >
          <FrameMarkers />

          <motion.div
            initial={{ opacity: 0, y: 56, rotateX: 12 }}
            animate={boardInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-none border border-border bg-card shadow-2xl shadow-foreground/10"
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                </div>
                <div className="hidden items-center rounded-none border border-border bg-card px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground sm:flex">
                  sprintly.app/acme/launch
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-1 rounded-none border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground sm:flex">
                  <Command className="size-2.5" />K
                </div>
                <div className="flex -space-x-1.5">
                  <div className="flex size-5 items-center justify-center rounded-full bg-muted-foreground text-[8px] font-semibold text-background ring-2 ring-card">
                    LR
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-[8px] font-semibold text-background ring-2 ring-card">
                    MK
                  </div>
                  <span className="ml-2 hidden text-[10px] text-muted-foreground sm:block">
                    2 online
                  </span>
                </div>
              </div>
            </div>

            {/* Board */}
            <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3 sm:p-4">
              {COLUMNS.map((column, i) => (
                <div
                  key={column}
                  className="flex min-h-[240px] flex-col gap-2 rounded-none border border-border/60 bg-background/50 p-2"
                >
                  <div className="flex items-center justify-between px-1.5 pb-1">
                    <span className="text-[11px] font-medium text-muted-foreground">{column}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {COUNTS[i]}
                    </span>
                  </div>

                  {i === 0 && (
                    <>
                      <StaticCard id="#208" tag="API" title="Rate limit retry logic" />
                      <StaticCard id="#215" tag="Bug" title="Mobile nav overflow" />
                    </>
                  )}
                  {i === 1 && <StaticCard id="#211" tag="Core" title="Design tokens audit" />}
                  {i === 2 && (
                    <>
                      <StaticCard id="#196" tag="Core" title="Org switcher" dim />
                      <StaticCard id="#199" tag="Auth" title="Session rotation" dim />
                    </>
                  )}

                  {stage === i && <MovingCard />}
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-[11.5px] text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="truncate"
                  >
                    {prefersReducedMotion ? "Maya moved #212 to In progress" : TICKER[stage]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground/70 sm:block">
                synced just now
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
