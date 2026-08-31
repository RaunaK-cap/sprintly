import * as React from "react";
import { Separator } from "@/components/ui/separator";

export function Comparison() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-[1280px] mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h3 className="text-xl font-medium text-ink mb-6">The old way</h3>
          <ul className="flex flex-col gap-6">
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink-muted">Scattered context</span>
              <span className="text-[14px] text-muted-foreground">Information lives across five different tools.</span>
            </li>
            <Separator />
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink-muted">Visual noise</span>
              <span className="text-[14px] text-muted-foreground">Endless bright colors and competing priorities.</span>
            </li>
            <Separator />
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink-muted">Manual updates</span>
              <span className="text-[14px] text-muted-foreground">Moving cards by hand and pinging people for status.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-muted/30 -mx-4 md:mx-0 p-4 md:p-8 border border-border">
          <h3 className="text-xl font-medium text-ink mb-6 flex items-center gap-2">
            <div className="size-2 bg-primary" />
            With Sprintly
          </h3>
          <ul className="flex flex-col gap-6">
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink">Single source of truth</span>
              <span className="text-[14px] text-ink-muted">Code, design, and product specs linked directly to tasks.</span>
            </li>
            <Separator className="bg-border/60" />
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink">Calm interface</span>
              <span className="text-[14px] text-ink-muted">Strict typographic hierarchy that highlights what matters.</span>
            </li>
            <Separator className="bg-border/60" />
            <li className="flex flex-col gap-1">
              <span className="text-[15px] font-medium text-ink">Automated flow</span>
              <span className="text-[14px] text-ink-muted">Tasks move themselves based on PR merges or design states.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

