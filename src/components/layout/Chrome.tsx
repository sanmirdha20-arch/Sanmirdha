import { AnimatePresence, motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { EASE } from "@/components/ui/motion-kit";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-brand" />;
}

export function Preloader() {
  const [show, setShow] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (sessionStorage.getItem("seen-preloader") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sessionStorage.setItem("seen-preloader", "1");
    setShow(true);
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      setN(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setShow(false), 150);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-between bg-foreground p-8 text-background"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="text-5xl font-semibold tracking-tight">{SITE.monogram}</span>
          <span className="font-mono text-5xl tabular-nums">{String(n).padStart(3, "0")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "view">("default");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 30 });
  const ry = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const move = (e: MouseEvent) => {
      x.set(e.clientX); y.set(e.clientY);
      const t = e.target as HTMLElement;
      if (t.closest("[data-cursor='view']")) setMode("view");
      else if (t.closest("a,button,[role='button']")) setMode("link");
      else setMode("default");
    };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); document.documentElement.classList.remove("has-cursor"); };
  }, [x, y]);

  if (!enabled) return null;
  const size = mode === "view" ? 80 : mode === "link" ? 44 : 28;
  return (
    <div className="pointer-events-none fixed inset-0 z-[150]" aria-hidden>
      <motion.div style={{ x, y }} className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-foreground" />
      <motion.div
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: size, height: size }}
        transition={{ duration: 0.3, ease: EASE }}
        className={`absolute flex items-center justify-center rounded-full border ${mode === "view" ? "border-transparent bg-foreground" : "border-foreground/40"}`}
      >
        {mode === "view" && <span className="label-mono text-[11px] text-background">View</span>}
      </motion.div>
    </div>
  );
}
