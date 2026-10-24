import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

export function VelocityMarquee({ text, baseVelocity = 3 }: { text: string; baseVelocity?: number }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() - Math.abs(move) * dir.current);
  });

  return (
    <div className="overflow-hidden border-y py-6 md:py-10" aria-hidden>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="text-outline pr-8 text-[clamp(3rem,10vw,9rem)] font-semibold leading-none tracking-[-0.04em]">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
