// TODO: replace placeholder projects, images and links with your real work.
// `image` — set to an image URL to replace the generated mockup.
export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  year: string;
  category: string;
  image?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
};

export const PROJECTS: Project[] = [
  { slug: "ecommerce-store", title: "E-Commerce Store", description: "A clean WooCommerce shop built to sell — fast product pages and a frictionless checkout.", tags: ["WordPress", "WooCommerce", "Design"], year: "2025", category: "E-commerce" },
  { slug: "restaurant-website", title: "Restaurant Website", description: "Menu, bookings and location in one appetising, mobile-first site.", tags: ["HTML/CSS", "JavaScript", "Responsive"], year: "2025", category: "Hospitality" },
  { slug: "business-landing", title: "Business Landing Page", description: "A focused landing page with one goal: turn visitors into leads.", tags: ["Landing Page", "SEO", "Conversion"], year: "2025", category: "Marketing" },
  { slug: "healthcare-portal", title: "Healthcare Portal", description: "A calm, trustworthy portal for a local clinic with a custom theme.", tags: ["WordPress", "Custom Theme", "Secure"], year: "2024", category: "Healthcare" },
  { slug: "educational-platform", title: "Educational Platform", description: "Courses, progress tracking and a simple dashboard for students.", tags: ["LMS", "Interactive", "Dashboard"], year: "2024", category: "Education" },
  { slug: "photography-portfolio", title: "Photography Portfolio", description: "A minimal gallery that gets out of the way and lets the photos speak.", tags: ["Portfolio", "Gallery", "Minimal"], year: "2024", category: "Portfolio" },
];
