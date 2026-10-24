import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { SITE, TECH_STRIP } from "@/data/site";
import { Magnetic, Marquee, SplitText, EASE } from "@/components/ui/motion-kit";
import { scrollToTarget } from "@/lib/scroll";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section id="home" ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pt-36 md:pt-44">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-site relative">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="label-mono flex items-center gap-2">
          <span className="animate-pulse-dot h-2 w-2 rounded-full bg-brand" /> Available for freelance work — 2026
        </motion.p>

        <div className="mt-8 grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 id="hero-title" className="display-hero">
              <SplitText immediate delay={0.2} text="I design & build *calm*, fast websites for growing brands." />
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease: EASE }} className="mt-8 max-w-[520px] text-lg text-muted-foreground">
              {SITE.description}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.8, ease: EASE }} className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <button onClick={() => scrollToTarget("#contact")} className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground">
                  Start a project <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Magnetic>
              <Magnetic>
                <button onClick={() => scrollToTarget("#work")} className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-muted">
                  See my work
                </button>
              </Magnetic>
            </motion.div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:col-span-4">
            <motion.div style={{ y: y1 }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1, ease: EASE }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl border bg-surface">
              <img src={SITE.portrait} alt="Portrait of San Mirdha" width={800} height={1000} loading="eager" fetchPriority="high" decoding="async"
                className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur">
                <div><p className="text-sm font-medium">{SITE.name}</p><p className="label-mono text-[10px]">Dumka, IN</p></div>
                <span className="h-2 w-2 rounded-full bg-brand" />
              </div>
            </motion.div>
            {[{ t: "Web Dev", c: "-left-6 top-10", y: y2 }, { t: "Design", c: "-right-4 top-1/3", y: y3 }, { t: "Fast", c: "-left-2 bottom-24", y: y2 }].map((chip, i) => (
              <motion.span key={chip.t} style={{ y: chip.y }} className={`absolute ${chip.c} hidden sm:block`}>
                <span className="animate-float-soft label-mono block rounded-full border bg-background px-3 py-1.5 text-foreground shadow-sm" style={{ animationDelay: `${i * 0.8}s` }}>{chip.t}</span>
              </motion.span>
            ))}
          </div>
        </div>

        <button onClick={() => scrollToTarget("#work")} className="label-mono mt-20 flex items-center gap-2 hover:text-foreground">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll
        </button>
      </div>

      <div className="mt-10 border-y py-6">
        <Marquee speed={45}>
          {TECH_STRIP.map((t) => (
            <span key={t} className="flex items-center gap-10 px-5 text-lg font-medium text-muted-foreground">
              {t} <span className="h-1 w-1 rounded-full bg-border" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
