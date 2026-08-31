import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { BentoGrid } from "@/components/landing/bento-grid";
import { ProductDepth } from "@/components/landing/product-depth";
import { Comparison } from "@/components/landing/comparison";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="force-light bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-ink">
      <Navigation />
      <Hero />
      <BentoGrid />
      <ProductDepth />
      <Comparison />
      <FinalCta />
      <Footer />
    </main>
  );
}
