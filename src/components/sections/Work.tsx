import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { PROJECTS, type Project } from "@/data/projects";
import { Reveal, SectionLabel } from "@/components/ui/motion-kit";

function Mockup({ index }: { index: number }) {
  const v = index % 3;
  return (
    <div className="absolute inset-0 bg-muted p-6 md:p-10">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-surface shadow-sm">
        <div className="flex items-center gap-1.5 border-b px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-border" /><span className="h-2 w-2 rounded-full bg-border" /><span className="h-2 w-2 rounded-full bg-border" />
          <span className="ml-3 h-3 w-1/3 rounded-full bg-muted" />
        </div>
        <div className="grid flex-1 gap-3 p-4 md:p-6" style={{ gridTemplateColumns: v === 1 ? "1fr 1fr" : "2fr 1fr" }}>
          <div className="flex flex-col gap-3">
            <span className="h-3 w-1/4 rounded-full bg-brand/70" />
            <span className="h-6 w-3/4 rounded-md bg-foreground/80" />
            <span className="h-6 w-1/2 rounded-md bg-foreground/80" />
            <span className="mt-2 h-2 w-2/3 rounded-full bg-muted" />
            <span className="h-2 w-1/2 rounded-full bg-muted" />
            <span className="mt-auto h-7 w-24 rounded-full bg-foreground" />
          </div>
          <div className={`rounded-lg ${v === 2 ? "bg-brand/20" : "bg-muted"}`} />
          {v !== 1 && <div className="col-span-2 grid grid-cols-3 gap-3">{[0, 1, 2].map((k) => <div key={k} className="h-12 rounded-lg bg-muted" />)}</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ p, i }: { p: Project; i: number }) {
  return (
    <article data-cursor="view" className="group shrink-0 lg:w-[60vw] lg:max-w-[880px]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border">
        <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-105">
          {p.image ? <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" /> : <Mockup index={i} />}
        </div>
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/5" />
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="label-mono">{String(i + 1).padStart(2, "0")} · {p.category} · {p.year}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</h3>
          <p className="mt-1 max-w-md text-muted-foreground">{p.description}</p>
        </div>
        <ArrowUpRight className="mt-6 h-6 w-6 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.tags.map((t) => <span key={t} className="rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground">{t}</span>)}
      </div>
    </article>
  );
}

export function Work() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);
      if (!section.current || !track.current) return;
      ctx = gsap.context(() => {
        const dist = () => track.current!.scrollWidth - window.innerWidth + 80;
        gsap.to(track.current, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
            onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`; },
          },
        });
      }, section);
    })();
    return () => ctx?.revert();
  }, []);

  return (
    <section id="work" ref={section} aria-labelledby="work-title" className="overflow-hidden py-28 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-16">
      <div className="container-site">
        <SectionLabel n="01">Selected work</SectionLabel>
        <Reveal><h2 id="work-title" className="display-section">Selected <span className="serif-accent">work</span></h2></Reveal>
      </div>
      <div ref={track} className="container-site mt-14 flex flex-col gap-16 lg:mx-0 lg:max-w-none lg:flex-row lg:gap-10 lg:pl-[max(1.25rem,calc((100vw-1200px)/2))] lg:pr-20">
        {PROJECTS.map((p, i) => <Card key={p.slug} p={p} i={i} />)}
      </div>
      <div className="container-site mt-10 flex items-center gap-6">
        <div className="hidden h-px flex-1 bg-border lg:block"><div ref={bar} className="h-px origin-left scale-x-0 bg-brand" /></div>
        <span className="label-mono cursor-not-allowed opacity-60" aria-disabled>View all projects ↗</span>
      </div>
    </section>
  );
}
