import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-bg-inverted py-32 px-4 md:px-8 text-center mt-24">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-background tracking-tight mb-6">
          Start building with Sprintly.
        </h2>
        <p className="text-[16px] text-muted mb-10 max-w-lg">
          Join thousands of teams moving faster and focusing better. Free for teams up to 10.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 w-full">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-none bg-transparent text-background border-border hover:bg-white/10 hover:text-white px-8 w-full sm:w-auto">
            Talk to Sales
          </Button>
        </div>
      </div>
    </section>
  );
}

