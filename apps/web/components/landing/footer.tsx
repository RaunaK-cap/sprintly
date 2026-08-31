import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-bg-inverted pt-16 pb-8 px-4 md:px-8 border-t border-border/10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-6 bg-background rounded-[2px]" />
              <span className="font-sans font-medium text-lg tracking-tight text-background">Sprintly</span>
            </Link>
            <p className="text-[14px] text-muted max-w-[240px]">
              The premium, quiet workspace for teams that ship.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-medium text-background">Product</h4>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Features</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Integrations</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Pricing</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Changelog</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-medium text-background">Resources</h4>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Documentation</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Blog</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Community</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Templates</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-medium text-background">Company</h4>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">About</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Careers</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Legal</Link>
            <Link href="#" className="text-[14px] text-muted hover:text-background transition-colors">Contact</Link>
          </div>
        </div>

        <Separator className="bg-border/20 mb-8" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12.5px] font-mono text-muted/60">
            © {new Date().getFullYear()} Sprintly, Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social placeholder icons */}
            <div className="size-8 rounded border border-border/20 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-muted text-[12px]">X</span>
            </div>
            <div className="size-8 rounded border border-border/20 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-muted text-[12px]">gh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

