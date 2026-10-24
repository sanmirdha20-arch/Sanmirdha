import { motion, useInView, useMotionValue, useSpring, useReducedMotion, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, className, delay = 0, as = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "p" }) {
  const C = motion[as];
  return (
    <C
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </C>
  );
}

/** Word-by-word mask-up reveal. Words wrapped in *asterisks* render as serif italic. */
export function SplitText({ text, className, delay = 0, immediate = false }: { text: string; className?: string; delay?: number; immediate?: boolean }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => {
        const accent = w.startsWith("*");
        const clean = w.replace(/\*/g, "");
        const anim = { y: "0%" };
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className={cn("inline-block", accent && "serif-accent pr-[0.05em]")}
              initial={{ y: "110%" }}
              {...(immediate ? { animate: anim } : { whileInView: anim, viewport: { once: true } })}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.06 }}
            >
              {clean}
            </motion.span>
            {i < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </span>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onMouseMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

export function Marquee({ children, speed = 40, reverse = false, vertical = false, pauseOnHover = true, className }: { children: ReactNode; speed?: number; reverse?: boolean; vertical?: boolean; pauseOnHover?: boolean; className?: string }) {
  const style = { "--speed": `${speed}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties;
  return (
    <div className={cn("group overflow-hidden", vertical ? "mask-fade-y h-full" : "mask-fade-x", className)}>
      <div
        className={cn("flex w-max gap-0", vertical ? "animate-marquee-y flex-col h-max w-full" : "animate-marquee-x", pauseOnHover && "group-hover:[animation-play-state:paused]")}
        style={style}
      >
        <div className={cn("flex shrink-0", vertical && "flex-col")}>{children}</div>
        <div className={cn("flex shrink-0", vertical && "flex-col")} aria-hidden>{children}</div>
      </div>
    </div>
  );
}

export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return <p className="label-mono mb-6">( {n} ) — {children}</p>;
}

export function onSpotlightMove(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
