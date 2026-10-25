// Tiny UI toolkit: safe HTML templating, toasts, modal + form helpers.

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

class Safe {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Safe(String(s ?? ""));

const part = (v) => {
  if (v instanceof Safe) return v.s;
  if (Array.isArray(v)) return v.map(part).join("");
  if (v === null || v === undefined || v === false) return "";
  return esc(v);
};
/** Tagged template: every interpolated value is HTML-escaped unless wrapped in raw() or produced by html``. */
export const html = (strings, ...vals) => new Safe(strings.reduce((out, s, i) => out + s + (i < vals.length ? part(vals[i]) : ""), ""));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");
export const fmtINR = (n) => (n === null || n === undefined || n === "" ? "—" : "₹" + Number(n).toLocaleString("en-IN"));
export const label = (s) => String(s).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
export const toLocalInput = (d) => {
  if (!d) return "";
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};

export function toast(message, type = "ok") {
  const host = $("#toasts");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.setAttribute("role", type === "error" ? "alert" : "status");
  t.textContent = message;
  host.appendChild(t);
  setTimeout(() => t.remove(), type === "error" ? 6000 : 3000);
}

export function badge(value) {
  return html`<span class="badge b-${esc(value)}">${label(value)}</span>`;
}

// ---------- modal ----------
let lastFocus = null;
export function openModal(content, { wide = false } = {}) {
  closeModal();
  lastFocus = document.activeElement;
  const root = $("#modal-root");
  root.innerHTML = html`<div class="overlay">
    <div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${content}</div>
  </div>`.toString();
  const overlay = $(".overlay", root);
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeModal(); });
  $$("[data-close]", root).forEach((b) => b.addEventListener("click", closeModal));
  const first = $("input, select, textarea, button.primary", root);
  first?.focus();
  return $(".modal", root);
}
export function closeModal() {
  const root = $("#modal-root");
  if (!root.innerHTML) return;
  root.innerHTML = "";
  lastFocus?.focus?.();
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ---------- generic form modal ----------
function fieldHtml(f) {
  const v = f.value ?? "";
  const common = `name="${esc(f.name)}" id="f_${esc(f.name)}" ${f.required ? "required" : ""}`;
  let control;
  if (f.type === "textarea") control = html`<textarea ${raw(common)} rows="${f.rows ?? 4}" maxlength="${f.max ?? 4000}">${v}</textarea>`;
  else if (f.type === "select") {
    control = html`<select ${raw(common)}>${(f.options ?? []).map((o) => {
      const val = typeof o === "object" ? o.value : o;
      const text = typeof o === "object" ? o.label : label(o);
      return html`<option value="${val}" ${String(val) === String(v) ? raw("selected") : ""}>${text}</option>`;
    })}</select>`;
  } else {
    const type = f.type === "datetime" ? "datetime-local" : f.type ?? "text";
    control = html`<input ${raw(common)} type="${type}" value="${v}" ${f.type === "number" ? raw('step="any" min="0"') : ""} maxlength="${f.max ?? 255}">`;
  }
  return html`<div class="field ${f.full === false ? "" : "full"}"><label for="f_${f.name}">${f.label}${f.required ? html` <span class="req">*</span>` : ""}</label>${control}</div>`;
}

export function openForm({ title, fields, submitText = "Save", onSubmit, onDelete, deleteText = "Delete" }) {
  const modal = openModal(html`
    <form id="modal-form" novalidate>
      <header><h2>${title}</h2><button type="button" class="icon-btn" data-close aria-label="Close">✕</button></header>
      <div class="grid">${fields.map(fieldHtml)}</div>
      <footer>
        ${onDelete ? html`<button type="button" class="danger" id="form-delete">${deleteText}</button>` : ""}
        <span class="spacer"></span>
        <button type="button" class="ghost" data-close>Cancel</button>
        <button type="submit" class="primary">${submitText}</button>
      </footer>
    </form>`);
  const form = $("#modal-form", modal);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = {};
    for (const f of fields) {
      const el = form.elements[f.name];
      let val = el.value.trim();
      if (val === "") val = null;
      else if (f.type === "number") val = Number(val);
      else if (f.type === "datetime") val = new Date(val).toISOString();
      values[f.name] = val;
    }
    const btn = $("button.primary", form);
    btn.disabled = true;
    try { await onSubmit(values); closeModal(); }
    catch (err) { toast(err.message || "Something went wrong", "error"); btn.disabled = false; }
  });
  $("#form-delete", modal)?.addEventListener("click", async () => {
    if (!confirm("Delete this permanently? This cannot be undone.")) return;
    try { await onDelete(); closeModal(); } catch (err) { toast(err.message, "error"); }
  });
}

export const empty = (msg) => html`<div class="empty">${msg}</div>`;
