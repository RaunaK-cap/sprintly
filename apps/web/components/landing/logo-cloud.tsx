import { cn } from "@/lib/utils";

const COMPANIES = [
  "ACME CORP",
  "Northwind",
  "hexlab",
  "MONO&CO",
  "Aster",
  "KITE",
  "Ostend",
  "Fern&Field",
];

export function LogoCloud() {
  return (
    <section aria-label="Trusted by" className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Trusted by product teams at
        </p>
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-16 pr-16">
            {[...COMPANIES, ...COMPANIES].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className={cn(
                  "whitespace-nowrap text-foreground/35",
                  i % 2 === 0
                    ? "text-lg font-semibold tracking-tight"
                    : "font-mono text-base uppercase"
                )}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
