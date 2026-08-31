"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Check, Zap, MessageSquare, Plus, Blocks } from "lucide-react";

function BentoCell({ 
  title, 
  description, 
  className,
  children,
  delay = 0 
}: { 
  title: string; 
  description: string; 
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`bg-white border border-border flex flex-col group hover:-translate-y-0.5 transition-transform duration-300 ${className}`}
    >
      <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-hidden bg-muted/10 relative">
        {children}
      </div>
      <div className="p-5 border-t border-border bg-white">
        <h3 className="text-[17px] font-medium text-ink leading-[1.3] mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-[1.4] max-w-[280px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Mini animations for cells
function ChecklistAnimation() {
  const [items, setItems] = React.useState([false, false, false]);
  
  React.useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        next[step] = true;
        return next;
      });
      step++;
      if (step > 2) {
        step = 0;
        setTimeout(() => setItems([false, false, false]), 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[200px] bg-white border border-border p-4 flex flex-col gap-3 shadow-sm">
      {items.map((checked, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`size-4 border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
            {checked && <Check className="size-3 text-white" />}
          </div>
          <div className={`h-2 flex-1 rounded-full transition-colors ${checked ? 'bg-muted' : 'bg-muted-foreground/30'}`} />
        </div>
      ))}
    </div>
  );
}

function AutomationAnimation() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-white border border-border px-3 py-1.5 text-[12px] font-mono text-ink-muted shadow-sm flex items-center gap-2">
        <span className="size-2 rounded-full bg-orange-400" /> Label added
      </div>
      <motion.div 
        className="h-[1px] bg-primary"
        initial={{ width: 0 }}
        animate={{ width: 40 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <div className="bg-white border border-border px-3 py-1.5 text-[12px] font-mono text-ink-muted shadow-sm flex items-center gap-2">
        <Zap className="size-3 text-primary" /> Assign user
      </div>
    </div>
  );
}

export function BentoGrid() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-[1280px] mx-auto" id="product">
      <div className="mb-12">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-ink mb-4">Everything you need, nothing you don't.</h2>
        <p className="text-[16px] text-muted-foreground">Purpose-built tools to manage your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[340px]">
        
        {/* Large cell: Boards & Lists */}
        <BentoCell 
          title="Infinite Boards" 
          description="Drag, drop, and organize your work effortlessly."
          className="md:col-span-2 md:row-span-2"
          delay={0}
        >
          {/* Abstract representation of a board */}
          <div className="w-full max-w-[500px] h-full pt-12 flex gap-4">
            {[1,2,3].map((col) => (
              <div key={col} className="flex-1 bg-muted/40 border border-border/50 p-2 flex flex-col gap-3">
                <div className="h-3 w-16 bg-muted-foreground/30 rounded-sm" />
                <motion.div 
                  className="bg-white border border-border h-24 shadow-sm"
                  animate={col === 2 ? { y: [0, -10, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="bg-white/50 border border-border/30 h-16 shadow-sm" />
              </div>
            ))}
          </div>
        </BentoCell>

        {/* Small cell: Checklists */}
        <BentoCell 
          title="Nested Checklists" 
          description="Break complex tasks down into actionable steps."
          delay={0.1}
        >
          <ChecklistAnimation />
        </BentoCell>

        {/* Small cell: Automation */}
        <BentoCell 
          title="Workflow Rules" 
          description="Automate the busywork with intuitive logic chains."
          delay={0.2}
        >
          <AutomationAnimation />
        </BentoCell>

        {/* Medium cell: Integrations */}
        <BentoCell 
          title="Connected Stack" 
          description="Syncs perfectly with your codebase and design tools."
          className="md:col-span-2"
          delay={0.1}
        >
          <div className="flex gap-4 items-center">
            {[1,2,3,4,5].map(i => (
              <motion.div 
                key={i}
                className="size-12 bg-white border border-border flex items-center justify-center shadow-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
              >
                <Blocks className="size-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </BentoCell>

        {/* Medium cell: Activity */}
        <BentoCell 
          title="Activity Streams" 
          description="See exactly who changed what, and when."
          delay={0.2}
        >
          <div className="w-full max-w-[200px] flex flex-col gap-4">
             <div className="flex gap-3 items-start opacity-70">
                <div className="size-6 rounded-full bg-muted-foreground/20" />
                <div className="h-2 w-24 bg-muted-foreground/30 rounded-full mt-2" />
             </div>
             <div className="flex gap-3 items-start">
                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="size-3 text-primary" />
                </div>
                <div className="flex flex-col gap-2 flex-1 mt-1">
                  <div className="h-2 w-20 bg-ink rounded-full" />
                  <div className="h-12 bg-white border border-border w-full shadow-sm" />
                </div>
             </div>
          </div>
        </BentoCell>

      </div>
    </section>
  );
}

