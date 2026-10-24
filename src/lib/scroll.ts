import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export function scrollToTarget(target: string | number, offset = -80) {
  if (typeof window === "undefined") return;
  if (lenis) {
    lenis.scrollTo(target as never, { offset: typeof target === "number" ? 0 : offset, duration: 1.2 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else {
    const el = document.querySelector(target);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
  }
}
