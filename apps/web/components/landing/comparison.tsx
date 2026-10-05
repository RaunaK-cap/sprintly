import * as React from "react";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const OLD_WAY = [
  {
    title: "Scattered context",
    description: "Information lives across five different tools.",
  },
  {
    title: "Visual noise",
    description: "Endless bright colors and competing priorities.",
  },
  {
    title: "Manual updates",
    description: "Moving cards by hand and pinging people for status.",
  },
];

const WITH_SPRINTLY = [
  {
    title: "Single source of truth",
    description: "Code, design, and product specs linked directly to tasks.",
  },
  {
    title: "Calm interface",
    description: "Strict typographic hierarchy that highlights what matters.",
  },
  {
    title: "Automated flow",
    description: "Tasks move themselves based on PR merges or design states.",
  },
];

export function Comparison() {
  return (
    <section id="compare" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Why Sprintly
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Trade the noise for a calmer default.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {/* The old way */}
          <div className="flex flex-col rounded-none border border-border/70 bg-background/40 p-8">
            <h3 className="mb-7 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              The old way
            </h3>
            <ul className="flex flex-col gap-6">
              {OLD_WAY.map((item, i) => (
                <React.Fragment key={item.title}>
                  {i > 0 && <Separator className="bg-border/50" />}
                  <li className="flex gap-3.5">
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-medium text-foreground/80">
                        {item.title}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </div>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* With Sprintly */}
          <div className="relative flex flex-col rounded-none border border-border bg-card p-8 shadow-xs">
            <h3 className="mb-7 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
              <span className="size-2 rounded-none bg-foreground" />
              With Sprintly
            </h3>
            <ul className="flex flex-col gap-6">
              {WITH_SPRINTLY.map((item, i) => (
                <React.Fragment key={item.title}>
                  {i > 0 && <Separator className="bg-border/60" />}
                  <li className="flex gap-3.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-none bg-foreground/10">
                      <Check className="size-2.5 text-foreground" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-medium">{item.title}</span>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </div>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
