import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollScale } from "@/components/layout/ScrollScale";
import { CustomCursor, Preloader, ScrollProgress } from "@/components/layout/Chrome";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About, Toolkit } from "@/components/sections/AboutToolkit";
import { Process, Services } from "@/components/sections/ServicesProcess";
import { Contact, Faq, Footer, Testimonials } from "@/components/sections/Closing";
import { VelocityMarquee } from "@/components/ui/VelocityMarquee";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE.title },
      { name: "description", content: SITE.description },
      { property: "og:title", content: SITE.title },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE.url },
      { property: "og:image", content: `${SITE.url}${SITE.ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `${SITE.url}${SITE.ogImage}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE.title },
      { name: "twitter:description", content: SITE.description },
    ],
    links: [{ rel: "canonical", href: SITE.url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE.name,
          url: SITE.url,
          jobTitle: "Freelance Web Developer & Graphic Designer",
          email: `mailto:${SITE.email}`,
          address: { "@type": "PostalAddress", addressLocality: "Dumka", addressRegion: "Jharkhand", addressCountry: "IN" },
          sameAs: [
            "https://www.linkedin.com/in/san-mirdha-48a53a387",
            "https://github.com/sanmirdha",
            "https://www.instagram.com/shanmirdha___",
            "https://x.com/shanmirdha___",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="grain">
      <a href="#main" className="sr-only z-[300] rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <SmoothScroll />
      <Preloader />
      <ScrollProgress />
      <CustomCursor />
      <ScrollScale />
      <Navbar />
      <main id="main">
        <Hero />
        <Work />
        <VelocityMarquee text="WEB DESIGN — GRAPHICS — VIDEO — EXCEL — " />
        <About />
        <Toolkit />
        <Services />
        <Process />
        <VelocityMarquee text="LET'S BUILD SOMETHING GREAT — " baseVelocity={4} />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
