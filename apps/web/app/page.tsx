import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { BentoGrid } from "@/components/landing/bento-grid";
import { ProductDepth } from "@/components/landing/product-depth";
import { Comparison } from "@/components/landing/comparison";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="overflow-x-clip">
        <Hero />
        {/* <LogoCloud /> */}
        <BentoGrid />
        <ProductDepth />
        <Comparison />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
