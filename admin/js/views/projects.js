import { api, clientOptions } from "../api.js";
import { PROJECT_STATUSES } from "../config.js";
import { html, $, $$, fmtDate, fmtINR, badge, openForm, toast, empty } from "../ui.js";

let projects = [], clients = [];
const clientName = (id) => clients.find((c) => c.id === id)?.name ?? "—";

export async function render(el) {
  [projects, clients] = await Promise.all([api.list("client_projects"), api.list("clients")]);
  draw(el);
}

function draw(el) {
  el.innerHTML = html`
    <div class="toolbar"><span class="muted">Client work, budgets and payments.</span><span class="spacer"></span><button class="primary" id="add">+ Add project</button></div>
    ${projects.length ? html`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Budget</th><th>Paid</th><th>Balance</th><th>Due</th></tr></thead>
      <tbody>${projects.map((p) => {
        const bal = Math.max(0, Number(p.budget_inr || 0) - Number(p.paid_inr || 0));
        return html`<tr class="clickable" data-id="${p.id}" tabindex="0">
          <td><strong>${p.title}</strong><div class="muted small">${clientName(p.client_id)}</div></td>
          <td>${badge(p.status)}</td><td>${fmtINR(p.budget_inr)}</td><td>${fmtINR(p.paid_inr)}</td>
          <td class="${bal > 0 ? "overdue" : ""}">${p.budget_inr ? fmtINR(bal) : "—"}</td><td>${fmtDate(p.due_date)}</td></tr>`;
      })}</tbody></table></div>` : empty("No projects yet. Add a project when a lead is won.")}`.toString();

  $("#add", el).addEventListener("click", () => edit(null, el));
  $$("tr.clickable", el).forEach((tr) => {
    const open = () => edit(projects.find((p) => p.id === tr.dataset.id), el);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  });
}

function edit(p, el) {
  openForm({
    title: p ? "Edit project" : "New project",
    fields: [
      { name: "title", label: "Project title", required: true, value: p?.title, max: 200 },
      { name: "client_id", label: "Client", type: "select", options: clientOptions(clients), value: p?.client_id ?? "", full: false },
      { name: "status", label: "Status", type: "select", options: PROJECT_STATUSES, value: p?.status ?? "planning", full: false },
      { name: "budget_inr", label: "Budget (₹)", type: "number", value: p?.budget_inr, full: false },
      { name: "paid_inr", label: "Paid so far (₹)", type: "number", value: p?.paid_inr ?? 0, full: false },
      { name: "start_date", label: "Start date", type: "date", value: p?.start_date, full: false },
      { name: "due_date", label: "Due date", type: "date", value: p?.due_date, full: false },
      { name: "notes", label: "Notes", type: "textarea", value: p?.notes },
    ],
    onSubmit: async (v) => {
      v.paid_inr = v.paid_inr ?? 0; // column is NOT NULL
      if (p) Object.assign(p, await api.update("client_projects", p.id, v));
      else projects.unshift(await api.insert("client_projects", v));
      draw(el); toast("Saved");
    },
    onDelete: p ? async () => { await api.remove("client_projects", p.id); projects = projects.filter((x) => x.id !== p.id); draw(el); toast("Deleted"); } : null,
  });
}
