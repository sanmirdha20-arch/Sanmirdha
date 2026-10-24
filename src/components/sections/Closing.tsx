import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Copy, Loader2, Mail, MapPin, MessageCircle, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FAQ } from "@/data/faq";
import { NAV, SITE, SOCIALS, WHATSAPP_USERNAME } from "@/data/site";
import { TESTIMONIALS } from "@/data/testimonials";
import { BUDGETS, PROJECT_TYPES, contactSchema, submitContact, type ContactPayload } from "@/lib/contact";
import { scrollToTarget } from "@/lib/scroll";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EASE, Marquee, Reveal, SectionLabel } from "@/components/ui/motion-kit";

function TCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  const initials = t.name.split(" ").map((p) => p[0]).join("");
  return (
    <figure className="mx-2.5 w-[340px] shrink-0 rounded-3xl border bg-surface p-7 md:w-[400px]">
      <div className="flex gap-0.5 text-brand">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
      <blockquote className="mt-5 text-[15px] leading-relaxed">"{t.quote}"</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-mono text-xs">{initials}</span>
        <span><span className="block text-sm font-medium">{t.name}</span><span className="label-mono text-[10px]">{t.role}</span></span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="section-pad">
      <div className="container-site">
        <SectionLabel n="06">Testimonials</SectionLabel>
        <Reveal><h2 id="testimonials-title" className="display-section">Kind <span className="serif-accent">words</span></h2></Reveal>
      </div>
      <div className="mt-14 space-y-5">
        <Marquee speed={55}>{TESTIMONIALS.slice(0, half).concat(TESTIMONIALS.slice(half)).map((t) => <TCard key={t.name} t={t} />)}</Marquee>
        <Marquee speed={55} reverse>{TESTIMONIALS.slice(half).concat(TESTIMONIALS.slice(0, half)).map((t) => <TCard key={t.name} t={t} />)}</Marquee>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad pt-0 md:pt-0">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionLabel n="07">FAQ</SectionLabel>
          <h2 id="faq-title" className="display-section">Good <span className="serif-accent">questions</span></h2>
        </div>
        <Accordion type="single" collapsible className="lg:col-span-8">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`}>
              <AccordionTrigger className="py-6 text-left text-lg font-medium hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-6 text-base text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function LocalTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date()));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t || "—"} IST</span>;
}

const field = "w-full rounded-2xl border bg-surface px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

export function Contact() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactPayload>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactPayload) => {
    const res = await submitContact(data);
    if (res.ok) { setDone(true); reset(); toast.success("Message sent — I'll reply within 24 hours."); }
    else toast.error(res.error ?? "Something went wrong. Please try email instead.");
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(SITE.email);
    toast.success("Email copied to clipboard");
  };

  const copyWhatsApp = async () => {
    await navigator.clipboard.writeText(`@${WHATSAPP_USERNAME}`);
    toast.success("WhatsApp username copied — search it in WhatsApp to chat");
  };

  const methods = [
    { icon: MapPin, label: "Location", value: SITE.location, href: SITE.mapsUrl },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad">
      <div className="container-site">
        <SectionLabel n="08">Contact</SectionLabel>
        <h2 id="contact-title" className="display-hero">Let's work <span className="serif-accent">together</span></h2>
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">Tell me about your project — I usually reply within 24 hours.</p>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <button onClick={copyEmail} className="group flex w-full items-center gap-4 rounded-3xl border bg-surface p-6 text-left transition-colors hover:border-foreground/30">
              <Mail className="h-5 w-5" strokeWidth={1.5} />
              <span className="flex-1"><span className="label-mono block">Email</span><span className="text-lg font-medium">{SITE.email}</span></span>
              <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </button>
            <button onClick={copyWhatsApp} className="group flex w-full items-center gap-4 rounded-3xl border bg-surface p-6 text-left transition-colors hover:border-foreground/30">
              <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
              <span className="flex-1"><span className="label-mono block">WhatsApp</span><span className="text-lg font-medium">@{WHATSAPP_USERNAME}</span></span>
              <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </button>
            {methods.map((m) => (
              <a key={m.label} href={m.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-3xl border bg-surface p-6 transition-colors hover:border-foreground/30">
                <m.icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="flex-1"><span className="label-mono block">{m.label}</span><span className="text-lg font-medium">{m.value}</span></span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            ))}
            <div className="flex items-center gap-4 rounded-3xl border p-6">
              <Clock className="h-5 w-5" strokeWidth={1.5} />
              <span><span className="label-mono block">Local time</span><span className="text-lg font-medium"><LocalTime /></span></span>
            </div>
          </div>

          <div className="lg:col-span-7">
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE, duration: 0.6 }} className="flex h-full min-h-96 flex-col items-center justify-center rounded-3xl border bg-surface p-10 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring" }} className="grid h-16 w-16 place-items-center rounded-full bg-brand text-brand-foreground"><Check className="h-8 w-8" /></motion.span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">Thanks — message received.</h3>
                <p className="mt-2 text-muted-foreground">I'll get back to you within 24 hours.</p>
                <button onClick={() => setDone(false)} className="mt-6 text-sm underline underline-offset-4">Send another</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-3xl border bg-surface/50 p-6 md:p-8">
                <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("company")} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div><input placeholder="Your name" aria-label="Name" className={field} {...register("name")} />{errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>}</div>
                  <div><input type="email" placeholder="Email address" aria-label="Email" className={field} {...register("email")} />{errors.email && <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>}</div>
                  <div>
                    <select aria-label="Project type" defaultValue="" className={field} {...register("projectType")}>
                      <option value="" disabled>Project type</option>
                      {PROJECT_TYPES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    {errors.projectType && <p className="mt-1.5 text-sm text-destructive">{errors.projectType.message}</p>}
                  </div>
                  <select aria-label="Budget range" defaultValue="" className={field} {...register("budget")}>
                    <option value="">Budget (optional)</option>
                    {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><textarea rows={6} placeholder="Tell me about your project…" aria-label="Message" className={field} {...register("message")} />{errors.message && <p className="mt-1.5 text-sm text-destructive">{errors.message.message}</p>}</div>
                <button disabled={isSubmitting} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground disabled:opacity-70 md:w-auto">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send message <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="overflow-hidden border-t pt-20">
      <div className="container-site grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{SITE.monogram}</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Freelance web developer & designer. Building calm, fast websites from Dumka, India.</p>
        </div>
        <ul className="space-y-2 text-sm">
          {NAV.map((n) => <li key={n.id}><button onClick={() => scrollToTarget(`#${n.id}`)} className="text-muted-foreground hover:text-foreground">{n.label}</button></li>)}
        </ul>
        <ul className="space-y-2 text-sm">
          {SOCIALS.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">{s.label} <ArrowUpRight className="h-3 w-3" /></a></li>)}
        </ul>
      </div>
      <div className="container-site mt-16 flex items-center justify-between border-t py-6">
        <p className="label-mono">© {new Date().getFullYear()} {SITE.name}</p>
        <button onClick={() => scrollToTarget(0)} className="label-mono inline-flex items-center gap-1 hover:text-foreground">Back to top <ArrowUp className="h-3 w-3" /></button>
      </div>
      <motion.p
        initial={{ y: "40%" }} whileInView={{ y: "18%" }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }}
        className="select-none whitespace-nowrap text-center text-[19vw] font-semibold leading-[0.8] tracking-[-0.06em]" aria-hidden
      >
        San Mirdha
      </motion.p>
    </footer>
  );
}
