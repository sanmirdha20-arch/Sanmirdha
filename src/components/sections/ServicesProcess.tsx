import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Code2, PenTool, Rocket, Search, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { PROCESS, SERVICES } from "@/data/services";
import { EASE, Reveal, SectionLabel } from "@/components/ui/motion-kit";
import { scrollToTarget } from "@/lib/scroll";

export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 25 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 25 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section id="services" aria-labelledby="services-title" className="section-pad">
      <div className="container-site">
        <SectionLabel n="04">Services</SectionLabel>
        <Reveal><h2 id="services-title" className="display-section">What I can do for <span className="serif-accent">you</span></h2></Reveal>
        <div
          ref={ref}
          className="relative mt-14 border-t"
          onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); x.set(e.clientX - r.left + 24); y.set(e.clientY - r.top - 80); }}
          onMouseLeave={() => setHover(null)}
        >
          {SERVICES.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={s.n} className="border-b" onMouseEnter={() => { setHover(i); if (matchMedia("(pointer: fine)").matches) setOpen(i); }}>
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center gap-6 py-7 text-left md:py-9">
                  <span className="label-mono w-8">{s.n}</span>
                  <span className={`flex-1 text-[clamp(1.5rem,3.5vw,2.75rem)] font-semibold tracking-[-0.03em] transition-colors ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</span>
                  <Plus className={`h-5 w-5 transition-transform duration-500 ${isOpen ? "rotate-45 text-brand" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                      <div className="grid gap-6 pb-9 pl-14 md:grid-cols-2">
                        <p className="max-w-md text-muted-foreground">{s.description}</p>
                        <div>
                          <ul className="space-y-2">{s.bullets.map((b) => <li key={b} className="flex items-center gap-2 text-sm"><span className="h-1 w-1 rounded-full bg-brand" />{b}</li>)}</ul>
                          <button onClick={() => scrollToTarget("#contact")} className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline hover:decoration-brand">
                            Get a quote <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <AnimatePresence>
            {hover !== null && (
              <motion.div style={{ x, y }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="pointer-events-none absolute left-0 top-0 hidden h-36 w-52 overflow-hidden rounded-2xl border bg-surface p-4 shadow-xl lg:block" aria-hidden>
                <p className="label-mono">{SERVICES[hover]?.n}</p>
                <p className="mt-6 text-lg font-semibold leading-tight tracking-tight">{SERVICES[hover]?.bullets[0]}</p>
                <span className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-brand/20" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const PICON = { search: Search, pen: PenTool, code: Code2, rocket: Rocket };

function ProcessCard({ step, i, total }: { step: (typeof PROCESS)[number]; i: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.03]);
  const Icon = PICON[step.icon];
  return (
    <div ref={ref} className="sticky h-[70vh]" style={{ top: `${110 + i * 24}px` }}>
      <motion.div style={{ scale }} className="flex h-[min(420px,60vh)] origin-top flex-col justify-between rounded-3xl border bg-surface p-8 shadow-sm md:p-12">
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm text-muted-foreground">Step {step.n} / 0{total}</span>
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[clamp(2rem,5vw,4rem)] font-semibold tracking-[-0.04em]">{step.title}</h3>
          <p className="mt-3 max-w-lg text-lg text-muted-foreground">{step.text}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="section-pad pt-0 md:pt-0">
      <div className="container-site">
        <SectionLabel n="05">Process</SectionLabel>
        <Reveal><h2 id="process-title" className="display-section">A simple, <span className="serif-accent">honest</span> process</h2></Reveal>
        <div className="mt-14">
          {PROCESS.map((s, i) => <ProcessCard key={s.n} step={s} i={i} total={PROCESS.length} />)}
        </div>
      </div>
    </section>
  );
}
