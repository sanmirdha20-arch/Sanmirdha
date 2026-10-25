import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

async function unwrap(promise) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data;
}

export const api = {
  list: (table, { order = "created_at", asc = false } = {}) =>
    unwrap(sb.from(table).select("*").order(order, { ascending: asc })),
  insert: (table, row) => unwrap(sb.from(table).insert(row).select().single()),
  update: (table, id, patch) => unwrap(sb.from(table).update(patch).eq("id", id).select().single()),
  remove: (table, id) => unwrap(sb.from(table).delete().eq("id", id)),
  isAdmin: async () => (await unwrap(sb.rpc("is_admin"))) === true,
};

/** Small cache of id → name for client pickers. */
export const clientOptions = (clients) => [{ value: "", label: "— none —" }, ...clients.map((c) => ({ value: c.id, label: c.company ? `${c.name} (${c.company})` : c.name }))];
