import { api, clientOptions } from "../api.js";
import { LEAD_STAGES } from "../config.js";
import { html, raw, $, $$, fmtINR, label, openForm, toast, empty } from "../ui.js";

let leads = [], clients = [];

export async function render(el) {
  [leads, clients] = await Promise.all([api.list("leads"), api.list("clients")]);
  draw(el);
}

const clientName = (id) => clients.find((c) => c.id === id)?.name ?? "";

function draw(el) {
  el.innerHTML = html`
    <div class="toolbar"><span class="muted">Move a lead between stages with the dropdown on its card.</span><span class="spacer"></span>
      <button class="primary" id="add">+ Add lead</button></div>
    ${leads.length ? "" : empty("No leads yet. Convert an inquiry into a lead, or add one manually.")}
    <div class="board">
      ${LEAD_STAGES.map((stage) => {
        const items = leads.filter((l) => l.stage === stage);
        const total = items.reduce((n, l) => n + Number(l.value_inr || 0), 0);
        return html`<section class="column"><header><h3>${label(stage)} <span class="count">${items.length}</span></h3><div class="muted small">${fmtINR(total)}</div></header>
          ${items.map((l) => html`<article class="lead-card" data-id="${l.id}" tabindex="0">
            <strong>${l.title}</strong>
            <div class="muted small">${clientName(l.client_id) || "No client"}</div>
            <div class="lead-foot"><span>${fmtINR(l.value_inr)}</span>
              <select class="stage-select" data-id="${l.id}" aria-label="Move stage">${LEAD_STAGES.map((st) => html`<option value="${st}" ${st === l.stage ? raw("selected") : ""}>${label(st)}</option>`)}</select></div>
          </article>`)}</section>`;
      })}
    </div>`.toString();

  $("#add", el).addEventListener("click", () => edit(null, el));
  $$(".lead-card", el).forEach((card) => {
    const open = () => edit(leads.find((l) => l.id === card.dataset.id), el);
    card.addEventListener("click", (e) => { if (!e.target.closest("select")) open(); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === card) open(); });
  });
  $$(".stage-select", el).forEach((sel) => sel.addEventListener("change", async () => {
    const lead = leads.find((l) => l.id === sel.dataset.id);
    try { Object.assign(lead, await api.update("leads", lead.id, { stage: sel.value })); draw(el); toast(`Moved to ${label(sel.value)}`); }
    catch (e) { toast(e.message, "error"); draw(el); }
  }));
}

function edit(lead, el) {
  openForm({
    title: lead ? "Edit lead" : "New lead",
    fields: [
      { name: "title", label: "Title", required: true, value: lead?.title, max: 200 },
      { name: "client_id", label: "Client", type: "select", options: clientOptions(clients), value: lead?.client_id ?? "", full: false },
      { name: "stage", label: "Stage", type: "select", options: LEAD_STAGES, value: lead?.stage ?? "new", full: false },
      { name: "value_inr", label: "Expected value (₹)", type: "number", value: lead?.value_inr },
      { name: "notes", label: "Notes", type: "textarea", value: lead?.notes },
    ],
    onSubmit: async (v) => {
      if (lead) Object.assign(lead, await api.update("leads", lead.id, v));
      else leads.unshift(await api.insert("leads", v));
      draw(el); toast("Saved");
    },
    onDelete: lead ? async () => { await api.remove("leads", lead.id); leads = leads.filter((l) => l.id !== lead.id); draw(el); toast("Deleted"); } : null,
  });
}
