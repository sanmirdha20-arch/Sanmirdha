import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Moon, Sun, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/data/site";
import { scrollToTarget } from "@/lib/scroll";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EASE } from "@/components/ui/motion-kit";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = (e: React.MouseEvent) => {
    const next = !dark;
    const apply = () => {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      setDark(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
    const r = Math.hypot(Math.max(e.clientX, innerWidth - e.clientX), Math.max(e.clientY, innerHeight - e.clientY));
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${e.clientX}px ${e.clientY}px)`, `circle(${r}px at ${e.clientX}px ${e.clientY}px)`] },
        { duration: 600, easing: "cubic-bezier(0.22,1,0.36,1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-muted">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCompact(y > 80);
    setHidden(y > prev && y > 300);
    let a = "";
    for (const n of NAV) {
      const el = document.getElementById(n.id);
      if (el && el.getBoundingClientRect().top < innerHeight * 0.4) a = n.id;
    }
    setActive(a);
  });

  const go = (id: string) => { setOpen(false); scrollToTarget(`#${id}`); };

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        aria-label="Main"
        className={`flex w-full max-w-4xl items-center justify-between rounded-full border bg-background/70 backdrop-blur-xl transition-all duration-500 ${compact ? "px-3 py-1.5" : "px-4 py-2.5"}`}
      >
        <button onClick={() => go("home")} className="px-2 text-lg font-semibold tracking-tight">{SITE.monogram}</button>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <button onClick={() => go(n.id)} className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                {active === n.id && <motion.span layoutId="nav-dot" className="h-1.5 w-1.5 rounded-full bg-brand" />}
                <span className={active === n.id ? "text-foreground" : ""}>{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => go("contact")} className="group hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:inline-flex">
            Hire me <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-full border lg:hidden"><Menu className="h-4 w-4" /></button>
            </SheetTrigger>
            <SheetContent side="top" className="h-dvh border-0 bg-background">
              <SheetTitle className="label-mono">Menu</SheetTitle>
              <ul className="mt-16 space-y-3">
                {NAV.map((n, i) => (
                  <motion.li key={n.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06, ease: EASE, duration: 0.6 }}>
                    <button onClick={() => go(n.id)} className="text-5xl font-semibold tracking-tight">{n.label}</button>
                  </motion.li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
