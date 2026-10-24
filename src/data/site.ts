export const SITE = {
  name: "San Mirdha",
  monogram: "San.",
  title: "San Mirdha — Freelance Web Developer & Graphic Designer",
  description:
    "Web developer, graphic designer & video editor helping small businesses and startups look premium and convert better.",
  email: "sanmirdha.in@gmail.com",
  location: "Ranibahal, Dumka, Jharkhand",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ranibahal+Dumka+Jharkhand",
  url: "https://sanmirdha.vercel.app",
  ogImage: "/og.png",
  portrait: "/portrait.webp",
  resumeUrl: "", // TODO: paste résumé link (e.g. Google Drive / /resume.pdf) — button is hidden while empty
};

// WhatsApp username (no phone number published). Shown as click-to-copy; add a share link later if you want a direct "open chat" button.
export const WHATSAPP_USERNAME = "shanmirdha___";

export const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/san-mirdha-48a53a387" },
  { label: "GitHub", href: "https://github.com/sanmirdha" },
  { label: "Instagram", href: "https://www.instagram.com/shanmirdha___" },
  { label: "X", href: "https://x.com/shanmirdha___" },
  { label: "Facebook", href: "https://facebook.com/sanmirdha" },
];

export const NAV = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

export const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "toolkit", label: "Toolkit" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

// TODO: replace with real numbers
export const STATS = [
  { value: 50, suffix: "+", label: "Projects delivered" },
  { value: 40, suffix: "+", label: "Happy clients" },
  { value: 3, suffix: "+", label: "Years freelancing" },
];

export const HOW_I_WORK = [
  "Clear scope and a fixed quote before anything starts.",
  "Weekly progress updates — you always know where things stand.",
  "Fast, accessible, SEO-ready code you actually own.",
];

export const TECH_STRIP = [
  "React", "TypeScript", "Tailwind", "WordPress", "WooCommerce", "Figma", "Photoshop",
  "Illustrator", "Premiere Pro", "After Effects", "Excel", "Supabase", "Vercel", "Git",
];

export const TOOLKIT = [
  { title: "Web Development", icon: "code", size: "lg", items: ["React", "TypeScript", "Tailwind CSS", "HTML / CSS", "JavaScript"] },
  { title: "WordPress & CMS", icon: "layout", size: "sm", items: ["WordPress", "WooCommerce", "Elementor", "Custom themes"] },
  { title: "Graphic Design", icon: "pen", size: "sm", items: ["Figma", "Photoshop", "Illustrator", "Canva"] },
  { title: "Video Editing", icon: "film", size: "sm", items: ["Premiere Pro", "After Effects", "CapCut", "Color grading"] },
  { title: "Excel & Data", icon: "table", size: "sm", items: ["Formulas", "Pivot tables", "Dashboards", "Automation"] },
  { title: "Tools", icon: "wrench", size: "lg", items: ["Git", "GitHub", "Vercel", "Supabase", "VS Code"] },
] as const;
