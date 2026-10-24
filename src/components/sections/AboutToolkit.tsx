import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Code2, Film, LayoutTemplate, PenTool, Table2, Wrench, Download, Check } from "lucide-react";
import { useRef } from "react";
import { HOW_I_WORK, SITE, STATS, TECH_STRIP, TOOLKIT } from "@/data/site";
import { CountUp, Marquee, Reveal, SectionLabel, onSpotlightMove } from "@/components/ui/motion-kit";

const STATEMENT =
  "I'm San Mirdha — a freelance web developer and designer from Dumka, Jharkhand. I turn messy ideas into clear, fast and beautiful digital products that help small businesses grow.";

function Word({ w, range, progress }: { w: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">{w}</motion.span>;
}

export function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = STATEMENT.split(" ");
  return (
    <section id="about" aria-labelledby="about-title" className="section-pad">
      <div className="container-site grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionLabel n="02">About</SectionLabel>
          <h2 id="about-title" className="sr-only">About San Mirdha</h2>
          <p ref={ref} className="text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.15] tracking-[-0.025em]">
            {words.map((w, i) => <Word key={i} w={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />)}
          </p>
          <Reveal className="mt-14">
            <p className="label-mono mb-4">How I work</p>
            <ul className="space-y-3">
              {HOW_I_WORK.map((h) => <li key={h} className="flex gap-3 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{h}</li>)}
            </ul>
            {SITE.resumeUrl && (
              <a href={SITE.resumeUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted">
                <Download className="h-4 w-4" /> Download résumé
              </a>
            )}
          </Reveal>
        </div>
        <div className="flex flex-col border-t lg:col-span-4 lg:border-t-0 lg:border-l">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="border-b px-0 py-8 lg:px-8">
              <p className="text-6xl font-semibold tracking-[-0.04em] tabular-nums"><CountUp to={s.value} suffix={s.suffix} /></p>
              <p className="label-mono mt-2">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const ICONS = { code: Code2, layout: LayoutTemplate, pen: PenTool, film: Film, table: Table2, wrench: Wrench };

export function Toolkit() {
  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className="section-pad pt-0 md:pt-0">
      <div className="container-site">
        <SectionLabel n="03">Toolkit</SectionLabel>
        <Reveal><h2 id="toolkit-title" className="display-section">My <span className="serif-accent">toolkit</span></h2></Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {TOOLKIT.map((t, i) => {
            const Icon = ICONS[t.icon];
            return (
              <Reveal key={t.title} delay={i * 0.06} className={t.size === "lg" ? "md:col-span-2" : "md:col-span-1"}>
                <div onMouseMove={onSpotlightMove} className="spotlight flex h-full min-h-56 flex-col rounded-3xl border bg-surface p-7">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                  <h3 className="mt-auto pt-10 text-xl font-semibold tracking-tight">{t.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.items.map((x) => <span key={x} className="rounded-full bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">{x}</span>)}
                  </div>
                </div>
              </Reveal>
            );
          })}
          <Reveal className="md:col-span-2">
            <div className="flex h-56 items-center gap-6 overflow-hidden rounded-3xl border bg-foreground p-7 text-background">
              <div className="w-1/2">
                <p className="font-mono text-xs uppercase tracking-[0.08em] opacity-60">Stack</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">14+ tools, <span className="serif-accent">one</span> workflow.</p>
              </div>
              <div className="h-full w-1/2">
                <Marquee vertical speed={18}>
                  {TECH_STRIP.map((t) => <span key={t} className="py-2 text-right text-lg font-medium opacity-80">{t}</span>)}
                </Marquee>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
