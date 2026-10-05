import * as React from "react";
import Link from "next/link";
import { Hexagon } from "lucide-react";

const FOOTER_COLUMNS: { heading: string; links: string[] }[] = [
  { heading: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
  { heading: "Resources", links: ["Documentation", "Blog", "Community", "Templates"] },
  { heading: "Company", links: ["About", "Careers", "Contact", "Legal"] },
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "X (Twitter)", href: "#", Icon: XIcon },
  { label: "GitHub", href: "#", Icon: GitHubIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-none bg-foreground">
                <Hexagon className="size-4 fill-background text-background" />
              </div>
              <span className="text-lg font-medium tracking-tight">Sprintly</span>
            </Link>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              The calm workspace for teams that ship. All your work, one board,
              zero noise.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-none border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3.5">
              <h4 className="text-[13px] font-medium">{column.heading}</h4>
              {column.links.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Sprintly, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
