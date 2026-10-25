import { api } from "../api.js";
import { html, $, $$, fmtDate, openForm, toast } from "../ui.js";

let templates = [];

export async function render(el) {
  templates = await api.list("email_templates", { order: "sort_order", asc: true });
  draw(el);
}

function draw(el) {
  el.innerHTML = html`
    <p class="muted">Used by <strong>Reply with a template</strong> in Inquiries. Placeholders:
      <code>{{name}}</code> <code>{{full_name}}</code> <code>{{project_type}}</code> <code>{{budget}}</code> <code>{{my_name}}</code></p>
    <div class="cards">${templates.map((t) => html`<article class="card tpl" data-id="${t.id}" tabindex="0">
      <h3>${t.name}</h3><div class="muted small">Subject: ${t.subject}</div>
      <pre>${t.body.slice(0, 220)}${t.body.length > 220 ? "…" : ""}</pre>
      <div class="muted small">Updated ${fmtDate(t.updated_at)}</div></article>`)}</div>`.toString();

  $$(".tpl", el).forEach((card) => {
    const open = () => edit(templates.find((t) => t.id === card.dataset.id), el);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  });
}

function edit(t, el) {
  openForm({
    title: `Edit: ${t.name}`,
    fields: [
      { name: "name", label: "Template name", required: true, value: t.name, max: 80 },
      { name: "subject", label: "Subject", required: true, value: t.subject, max: 200 },
      { name: "body", label: "Body", type: "textarea", rows: 14, required: true, value: t.body, max: 8000 },
    ],
    onSubmit: async (v) => { Object.assign(t, await api.update("email_templates", t.id, v)); draw(el); toast("Template saved"); },
  });
}
