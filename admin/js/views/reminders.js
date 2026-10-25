import { api, clientOptions } from "../api.js";
import { html, raw, $, $$, fmtDateTime, toLocalInput, openForm, toast, empty } from "../ui.js";

let reminders = [], clients = [], leads = [];

export async function render(el) {
  [reminders, clients, leads] = await Promise.all([api.list("reminders", { order: "due_at", asc: true }), api.list("clients"), api.list("leads")]);
  draw(el);
}

const clientName = (id) => clients.find((c) => c.id === id)?.name;
const leadTitle = (id) => leads.find((l) => l.id === id)?.title;

function row(r) {
  const overdue = !r.done && new Date(r.due_at) < new Date();
  const ctx = [clientName(r.client_id), leadTitle(r.lead_id)].filter(Boolean).join(" · ");
  return html`<li class="${r.done ? "done" : ""}">
    <input type="checkbox" data-toggle="${r.id}" ${r.done ? raw("checked") : ""} aria-label="Mark done">
    <span class="grow"><strong>${r.title}</strong>
      <div class="muted small ${overdue ? "overdue" : ""}">${overdue ? "Overdue · " : ""}${fmtDateTime(r.due_at)}${ctx ? ` · ${ctx}` : ""}</div></span>
    <button class="ghost small-btn" data-edit="${r.id}">Edit</button></li>`;
}

function draw(el) {
  const open = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done).reverse();
  el.innerHTML = html`
    <div class="toolbar"><span class="muted">Never forget a follow-up.</span><span class="spacer"></span><button class="primary" id="add">+ Add reminder</button></div>
    <section class="card"><div class="card-head"><h3>To do <span class="count">${open.length}</span></h3></div>
      ${open.length ? html`<ul class="list checks">${open.map(row)}</ul>` : empty("All caught up.")}</section>
    ${done.length ? html`<section class="card"><div class="card-head"><h3>Done</h3></div><ul class="list checks">${done.map(row)}</ul></section>` : ""}`.toString();

  $("#add", el).addEventListener("click", () => edit(null, el));
  $$("[data-edit]", el).forEach((b) => b.addEventListener("click", () => edit(reminders.find((r) => r.id === b.dataset.edit), el)));
  $$("[data-toggle]", el).forEach((cb) => cb.addEventListener("change", async () => {
    const r = reminders.find((x) => x.id === cb.dataset.toggle);
    try { Object.assign(r, await api.update("reminders", r.id, { done: cb.checked })); draw(el); }
    catch (e) { toast(e.message, "error"); draw(el); }
  }));
}

function edit(r, el) {
  const tomorrow9 = new Date(Date.now() + 86400000); tomorrow9.setHours(9, 0, 0, 0);
  openForm({
    title: r ? "Edit reminder" : "New reminder",
    fields: [
      { name: "title", label: "What do you need to do?", required: true, value: r?.title, max: 200 },
      { name: "due_at", label: "When", type: "datetime", required: true, value: toLocalInput(r?.due_at ?? tomorrow9) },
      { name: "client_id", label: "Client (optional)", type: "select", options: clientOptions(clients), value: r?.client_id ?? "", full: false },
      { name: "lead_id", label: "Lead (optional)", type: "select", options: [{ value: "", label: "— none —" }, ...leads.map((l) => ({ value: l.id, label: l.title }))], value: r?.lead_id ?? "", full: false },
    ],
    onSubmit: async (v) => {
      if (r) Object.assign(r, await api.update("reminders", r.id, v));
      else reminders.push(await api.insert("reminders", v));
      reminders.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
      draw(el); toast("Saved");
    },
    onDelete: r ? async () => { await api.remove("reminders", r.id); reminders = reminders.filter((x) => x.id !== r.id); draw(el); toast("Deleted"); } : null,
  });
}
