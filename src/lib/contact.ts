import { z } from "zod";

export const PROJECT_TYPES = ["Website", "Landing page", "Design", "Video", "Excel", "Other"] as const;
export const BUDGETS = ["Under ₹10k", "₹10k – ₹25k", "₹25k – ₹50k", "₹50k+", "Not sure yet"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: "Pick a project type" }) }),
  budget: z.string().max(40).optional(),
  message: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(2000),
  company: z.string().max(0).optional(), // honeypot
});

export type ContactPayload = z.infer<typeof contactSchema>;

// Supabase publishable key is designed to be public; Row Level Security only lets visitors INSERT.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://vsaeehglvnjftxaubiqg.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_Q3b6GuSLbqWqnV3WfgP_5w_7RdlSebd";

/** Saves the enquiry to `contact_submissions` (public INSERT-only via RLS). */
export async function submitContact(payload: ContactPayload): Promise<{ ok: boolean; error?: string }> {
  if (payload.company) return { ok: true }; // honeypot hit — pretend success, store nothing
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal", // visitors cannot SELECT, so never ask for the row back
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        project_type: payload.projectType,
        budget: payload.budget || null,
        message: payload.message,
      }),
    });
    if (!res.ok) return { ok: false, error: "Could not send your message. Please email me directly." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again or email me directly." };
  }
}
