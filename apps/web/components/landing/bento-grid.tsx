"use client";

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  Blocks,
  Check,
  Keyboard,
  LayoutGrid,
  ListChecks,
  MousePointer2,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Cell ---------------------------------- */

function BentoCell({
  title,
  description,
  icon: Icon,
  className,
  delay = 0,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-none border border-border bg-card shadow-xs",
        className
      )}
    >
      <div className="p-6 pb-4">
        <div className="mb-2.5 flex size-8 items-center justify-center rounded-none border border-border bg-muted/50 text-foreground">
          <Icon className="size-4" />
        </div>
        <h3 className="text-[15px] font-medium tracking-tight">{title}</h3>
        <p className="mt-1 max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="relative flex-1 px-6 pb-6">{children}</div>
    </motion.div>
  );
}

/* ------------------------- A. Draggable live board ------------------------ */

const BOARD_COLUMNS = ["To do", "In progress", "Done"] as const;

function MiniStaticCard({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-none border border-border/70 bg-card px-2.5 py-2">
      <p className="text-[11.5px] font-medium leading-snug">{title}</p>
      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/70">{meta}</p>
    </div>
  );
}

function BoardVisual() {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [stage, setStage] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [hasDragged, setHasDragged] = React.useState(false);

  React.useEffect(() => {
    if (!inView || prefersReducedMotion || dragging) return;
    const id = setInterval(() => setStage((s) => (s + 1) % BOARD_COLUMNS.length), 3200);
    return () => clearInterval(id);
  }, [inView, prefersReducedMotion, dragging]);

  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[300px] flex-col rounded-none border border-border/60 bg-background/60 p-3"
    >
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
        <AnimatePresence>
          {!hasDragged && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-none border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-xs"
            >
              Try dragging me
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {BOARD_COLUMNS.map((column, i) => (
          <div
            key={column}
            className="flex min-h-[190px] flex-col gap-2 rounded-none bg-muted/40 p-1.5"
          >
            <div className="flex items-center justify-between px-1 py-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">{column}</span>
              <span className="font-mono text-[9px] text-muted-foreground/60">
                {i === 0 ? "3" : i === 1 ? "2" : "3"}
              </span>
            </div>

            {i === 0 && (
              <>
                <MiniStaticCard title="Prisma migrations" meta="#103 · API" />
                <MiniStaticCard title="Auth rate limits" meta="#208 · API" />
              </>
            )}
            {i === 1 && (
              <>
                <MiniStaticCard title="WebSocket engine" meta="#104 · Realtime" />
                <MiniStaticCard title="Design tokens audit" meta="#211 · Core" />
              </>
            )}
            {i === 2 && (
              <>
                <MiniStaticCard title="Org switcher" meta="#98 · Shipped" />
                <MiniStaticCard title="Auth sessions" meta="#99 · Shipped" />
              </>
            )}

            {stage === i && (
              <motion.div
                layoutId="bento-board-card"
                drag
                dragSnapToOrigin
                dragElastic={0.18}
                whileDrag={{ scale: 1.04, rotate: 2, zIndex: 20 }}
                onDragStart={() => {
                  setDragging(true);
                  setHasDragged(true);
                }}
                onDragEnd={() => setDragging(false)}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={cn(
                  "cursor-grab touch-none rounded-none border bg-card p-2.5 shadow-sm shadow-foreground/5 active:cursor-grabbing",
                  dragging ? "border-foreground/30" : "border-border"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="rounded-none bg-muted px-1.5 py-0.5 text-[8.5px] font-medium text-muted-foreground">
                    Design
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">#102</span>
                </div>
                <p className="text-[11.5px] font-medium leading-snug">Launch checklist</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-none bg-foreground" />
                </div>
              </motion.div>
            )}

            <div className="mt-auto rounded-none border border-dashed border-border/70 px-2.5 py-1.5 text-center text-[10px] text-muted-foreground/50">
              + Add card
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- B. Presence cursors -------------------------- */

function Cursor({
  name,
  colorClass,
  path,
  duration,
  reduce,
}: {
  name: string;
  colorClass: string;
  path: { x: number[]; y: number[] };
  duration: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      className="absolute left-0 top-0 z-10"
      animate={reduce ? { x: path.x[0], y: path.y[0] } : path}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <MousePointer2 className={cn("size-3.5 fill-current", colorClass)} />
      <span
        className={cn(
          "ml-3 -mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white",
          colorClass
        )}
      >
        {name}
      </span>
    </motion.div>
  );
}

function PresenceVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-full min-h-[200px] items-center justify-center overflow-hidden rounded-none border border-border/60 bg-background/60 p-4">
      <div className="flex w-full max-w-[220px] flex-col gap-2.5">
        <div className="h-2 w-full rounded-full bg-foreground/15" />
        <div className="h-2 w-4/5 rounded-full bg-foreground/15" />
        <div className="h-2 w-3/5 rounded-full bg-foreground/15" />
        <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
      </div>

      <Cursor
        name="Maya"
        colorClass="bg-foreground"
        path={{ x: [30, 150, 80, 30], y: [24, 70, 110, 24] }}
        duration={11}
        reduce={!!prefersReducedMotion}
      />
      <Cursor
        name="Leo"
        colorClass="bg-emerald-500"
        path={{ x: [180, 60, 130, 180], y: [110, 30, 80, 110] }}
        duration={14}
        reduce={!!prefersReducedMotion}
      />
    </div>
  );
}

/* --------------------------- C. Automation rules --------------------------- */

function AutomationVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-1 rounded-none border border-border/60 bg-background/60 p-4">
      <div className="w-full max-w-[220px] rounded-none border border-border bg-card px-3 py-2 shadow-xs">
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
          When
        </span>
        <p className="text-[12px] font-medium">
          Card moves to <span className="text-foreground">Done</span>
        </p>
      </div>

      <div className="relative h-7 w-px bg-border">
        <motion.span
          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-none bg-foreground"
          animate={
            prefersReducedMotion
              ? { top: "100%", opacity: 0 }
              : { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }
          }
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 1.1, repeat: Infinity, ease: "easeIn", repeatDelay: 1.9 }
          }
        />
      </div>

      <div className="w-full max-w-[220px] rounded-none border border-border bg-card px-3 py-2 shadow-xs">
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
          Then
        </span>
        <p className="text-[12px] font-medium">
          Notify <span className="text-foreground">#launches</span>
        </p>
      </div>

      <motion.div
        className="mt-2 flex items-center gap-1.5 rounded-none border border-border bg-card px-3 py-1.5 text-[11px] shadow-xs"
        animate={
          prefersReducedMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : {
                opacity: [0, 0, 1, 1, 0],
                y: [8, 8, 0, 0, -4],
                scale: [0.95, 0.95, 1, 1, 0.96],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : { duration: 3, repeat: Infinity, times: [0, 0.42, 0.52, 0.86, 1], ease: "easeOut" }
        }
      >
        <Check className="size-3 text-foreground" />
        Sent to #launches
      </motion.div>
    </div>
  );
}

/* ------------------------------ D. Stack sync ------------------------------ */

const SYNC_MESSAGES = [
  "Synced just now",
  "Sarah linked PR #482",
  "Figma frame updated",
  "Webhook delivered",
];

function SyncVisual() {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const id = setInterval(() => setTick((t) => (t + 1) % SYNC_MESSAGES.length), 2400);
    return () => clearInterval(id);
  }, [inView, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className="flex h-full min-h-[140px] flex-col justify-center gap-4 rounded-none border border-border/60 bg-background/60 p-4 md:flex-row md:items-center"
    >
      <div className="flex items-center gap-2">
        {[
          { name: "GitHub", dot: "bg-foreground" },
          { name: "Figma", dot: "bg-muted-foreground" },
          { name: "Slack", dot: "bg-muted-foreground" },
        ].map((tool) => (
          <div
            key={tool.name}
            className="flex items-center gap-1.5 rounded-none border border-border bg-card px-2.5 py-2 text-[11.5px] font-medium shadow-xs"
          >
            <span className={cn("size-1.5 rounded-full", tool.dot)} />
            {tool.name}
          </div>
        ))}
      </div>

      <div className="relative mx-1 h-px flex-1 bg-border">
        <motion.span
          className="absolute -top-[2.5px] size-1.5 rounded-none bg-foreground"
          animate={prefersReducedMotion ? { left: "100%" } : { left: ["0%", "100%"] }}
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }
          }
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 text-[11.5px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <AnimatePresence mode="wait">
          <motion.span
            key={tick}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {prefersReducedMotion ? SYNC_MESSAGES[0] : SYNC_MESSAGES[tick]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------- E. Checklist ------------------------------ */

const CHECK_ITEMS = ["Database indexes", "E2E test suite", "Production deploy"];

function ChecklistVisual() {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [done, setDone] = React.useState(0);

  React.useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const id = setInterval(() => setDone((d) => (d + 1) % (CHECK_ITEMS.length + 1)), 1300);
    return () => clearInterval(id);
  }, [inView, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className="flex h-full min-h-[200px] flex-col justify-center rounded-none border border-border/60 bg-background/60 p-4"
    >
      <div className="w-full max-w-[220px]">
        <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sprint 24
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{done}/3</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {CHECK_ITEMS.map((item, i) => {
            const checked = i < done;
            return (
              <div key={item} className="flex items-center gap-2">
                <motion.div
                  animate={checked ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-none border",
                    checked ? "border-foreground bg-foreground" : "border-border bg-card"
                  )}
                >
                  {checked && <Check className="size-2.5 stroke-[3] text-background" />}
                </motion.div>
                <span
                  className={cn(
                    "text-[12px]",
                    checked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-none bg-foreground"
            animate={{ width: `${(done / CHECK_ITEMS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Section --------------------------------- */

const HIGHLIGHTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Zap,
    title: "Instant by default",
    description: "Optimistic updates land in under 50 ms — no spinners, ever.",
  },
  {
    icon: Keyboard,
    title: "Keyboard-first",
    description: "Every action is one ⌘K away. Your hands never leave the keys.",
  },
  {
    icon: Blocks,
    title: "Plays well with others",
    description: "GitHub, Figma, and Slack connect in a couple of clicks.",
  },
];

export function BentoGrid() {
  return (
    <section id="features" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Everything you need, nothing you don&rsquo;t.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
            Purpose-built tools that keep the work moving — and the noise out.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <BentoCell
            title="Drag, drop, done"
            description="Boards feel physical. Grab a card and it follows your hand with spring physics."
            icon={LayoutGrid}
            className="md:col-span-2 md:row-span-2"
          >
            <BoardVisual />
          </BentoCell>

          <BentoCell
            title="Real-time presence"
            description="See who&apos;s on the board with you, live."
            icon={Users}
            delay={0.08}
          >
            <PresenceVisual />
          </BentoCell>

          <BentoCell
            title="Rules that run themselves"
            description="Handoffs happen automatically, so status updates itself."
            icon={Workflow}
            delay={0.12}
          >
            <AutomationVisual />
          </BentoCell>

          <BentoCell
            title="Your stack, in sync"
            description="Code, design, and chat stay attached to the work."
            icon={Blocks}
            className="md:col-span-2"
            delay={0.08}
          >
            <SyncVisual />
          </BentoCell>

          <BentoCell
            title="Progress you can see"
            description="Nested checklists with quiet, honest progress."
            icon={ListChecks}
            delay={0.12}
          >
            <ChecklistVisual />
          </BentoCell>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="flex size-9 items-center justify-center rounded-none border border-border bg-card shadow-xs">
                <item.icon className="size-4" />
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
