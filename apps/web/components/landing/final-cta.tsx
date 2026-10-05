"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function Float({
  className,
  delay,
  reduce,
  children,
}: {
  className?: string;
  delay: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <motion.div
        animate={reduce ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 5 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function FinalCta() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-4 pb-24 pt-4 md:px-8 md:pb-32">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-none bg-bg-inverted px-6 py-20 md:px-16 md:py-28">
        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col items-start">
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-background md:text-5xl">
              Start building with Sprintly.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-background/60">
              Join thousands of teams moving faster and focusing better. Your
              first board takes about thirty seconds.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-11 rounded-none bg-background px-7 text-sm text-foreground hover:bg-background"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Get started free
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-none border-background/20 bg-transparent px-7 text-sm text-background hover:bg-transparent hover:text-background"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-background/40">
              <Check className="size-3.5" />
              Free for teams up to 10 · No credit card required
            </p>
          </div>

          {/* Floating collage */}
          <div className="relative hidden h-[340px] select-none sm:block" aria-hidden>
            <Float
              reduce={!!prefersReducedMotion}
              delay={0.1}
              className="absolute left-0 top-10 w-56 -rotate-6"
            >
              <div className="rounded-none border border-black/5 bg-card p-4 text-card-foreground shadow-2xl shadow-black/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-none bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Design
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">#212</span>
                </div>
                <p className="text-[13px] font-medium leading-snug">Redesign onboarding flow</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-[8px] font-semibold text-background">
                    MK
                  </div>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 rounded-none bg-foreground" />
                  </div>
                </div>
              </div>
            </Float>

            <Float
              reduce={!!prefersReducedMotion}
              delay={0.35}
              className="absolute right-0 top-0 w-52 rotate-[4deg]"
            >
              <div className="rounded-none border border-black/5 bg-card p-4 text-card-foreground shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted-foreground text-[9px] font-semibold text-background">
                    LR
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium leading-none">Leo R.</span>
                    <span className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                      just now
                    </span>
                  </div>
                </div>
                <p className="mt-2.5 text-[12.5px] leading-snug text-foreground/90">
                  Moving this to Done — shipping Friday.
                </p>
              </div>
            </Float>

            <Float
              reduce={!!prefersReducedMotion}
              delay={0.55}
              className="absolute bottom-0 right-8 w-52 rotate-2"
            >
              <div className="rounded-none border border-black/5 bg-card p-4 text-card-foreground shadow-2xl shadow-black/20">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">Velocity</span>
                  <span className="text-[13px] font-semibold text-foreground">+28%</span>
                </div>
                <div className="mt-3 flex h-14 items-end gap-1.5">
                  {[40, 62, 48, 78, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: "easeOut" }}
                      className="flex-1 rounded-none bg-foreground/80"
                    />
                  ))}
                </div>
              </div>
            </Float>
          </div>
        </div>
      </div>
    </section>
  );
}
