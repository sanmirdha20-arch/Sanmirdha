import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/data/site";
import { scrollToTarget } from "@/lib/scroll";

const TICKS = 61;

function Tick({ i, progress, boundary }: { i: number; progress: MotionValue<number>; boundary?: string | undefined }) {
  const pos = i / (TICKS - 1);
  const scale = useTransform(progress, (p) => 1 + Math.max(0, 1 - Math.abs(p - pos) * 10) * 1.4);
  const long = i % 10 === 0;
  return (
    <div className="group/tick relative flex h-full items-center justify-end" title={boundary}>
      <motion.span
        style={{ scaleX: scale }}
        className={`block h-px origin-right ${long || boundary ? "w-4 bg-foreground/60" : "w-2 bg-foreground/25"} ${boundary ? "bg-foreground" : ""}`}
      />
      {boundary && (
        <span className="label-mono pointer-events-none absolute right-6 whitespace-nowrap rounded-full border bg-background px-2 py-0.5 text-[10px] opacity-0 transition-opacity group-hover/tick:opacity-100">
          {boundary}
        </span>
      )}
    </div>
  );
}

export function ScrollScale() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const top = useTransform(progress, (p) => `${p * 100}%`);
  const [pct, setPct] = useState(0);
  const [section, setSection] = useState("Home");
  const [boundaries, setBoundaries] = useState<Record<number, string>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const map: Record<number, string> = {};
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (!el || max <= 0) return;
        const p = Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max);
        map[Math.round(p * (TICKS - 1))] = s.label;
      });
      setBoundaries(map);
    };
    compute();
    const t = setTimeout(compute, 1500);
    window.addEventListener("resize", compute);
    return () => { clearTimeout(t); window.removeEventListener("resize", compute); };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setPct(Math.round(p * 100));
    let current = "Home";
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.label;
    }
    setSection(current);
  });

  const seek = (clientY: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    scrollToTarget(p * (document.documentElement.scrollHeight - window.innerHeight));
  };

  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 md:block" aria-hidden>
      <div
        ref={trackRef}
        className="relative flex h-[50vh] w-10 cursor-pointer flex-col justify-between"
        onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); seek(e.clientY); }}
        onPointerMove={(e) => dragging.current && seek(e.clientY)}
        onPointerUp={() => (dragging.current = false)}
      >
        {Array.from({ length: TICKS }).map((_, i) => (
          <div key={i} className="h-px flex-1">
            <Tick i={i} progress={progress} boundary={boundaries[i]} />
          </div>
        ))}
        <motion.div style={{ top }} className="pointer-events-none absolute right-0 flex -translate-y-1/2 items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] tabular-nums text-foreground">{String(pct).padStart(3, "0")}</span>
            <span className="label-mono text-[9px]">{section}</span>
          </div>
          <span className="block h-[2px] w-6 rounded-full bg-brand" />
        </motion.div>
      </div>
    </div>
  );
}
