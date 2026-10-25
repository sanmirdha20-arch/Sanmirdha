import { api } from "../api.js";
import { html, $, $$, fmtDate, openForm, toast, empty } from "../ui.js";

let clients = [], q = "";

export async function render(el) {
  q = "";
  clients = await api.list("clients");
  draw(el);
}

function draw(el) {
  const needle = q.toLowerCase();
  const rows = clients.filter((c) => !needle || `${c.name} ${c.company ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(needle));
  el.innerHTML = html`
    <div class="toolbar"><input type="search" id="q" placeholder="Search clients…" value="${q}" aria-label="Search clients"><span class="spacer"></span>
      <button class="primary" id="add">+ Add client</button></div>
    ${rows.length ? html`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Source</th><th>Added</th></tr></thead>
      <tbody>${rows.map((c) => html`<tr class="clickable" data-id="${c.id}" tabindex="0">
        <td><strong>${c.name}</strong><div class="muted small">${c.company ?? ""}</div></td>
        <td>${c.email ? html`<div>${c.email}</div>` : ""}${c.phone ? html`<div class="muted small">${c.phone}</div>` : ""}</td>
        <td>${c.source ?? "—"}</td><td>${fmtDate(c.created_at)}</td></tr>`)}</tbody></table></div>`
      : empty(clients.length ? "No clients match your search." : "No clients yet. Add one, or convert an inquiry.")}`.toString();

  $("#add", el).addEventListener("click", () => edit(null, el));
  const q$ = $("#q", el);
  q$.addEventListener("input", () => { q = q$.value; const p = q$.selectionStart; draw(el); const n = $("#q", el); n.focus(); n.setSelectionRange(p, p); });
  $$("tr.clickable", el).forEach((tr) => {
    const open = () => edit(clients.find((c) => c.id === tr.dataset.id), el);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  });
}

function edit(c, el) {
  openForm({
    title: c ? "Edit client" : "New client",
    fields: [
      { name: "name", label: "Name", required: true, value: c?.name, max: 120, full: false },
      { name: "company", label: "Company", value: c?.company, full: false },
      { name: "email", label: "Email", type: "email", value: c?.email, full: false },
      { name: "phone", label: "Phone", type: "tel", value: c?.phone, max: 30, full: false },
      { name: "source", label: "Source", value: c?.source, max: 80 },
      { name: "notes", label: "Notes", type: "textarea", value: c?.notes },
    ],
    onSubmit: async (v) => {
      if (c) Object.assign(c, await api.update("clients", c.id, v));
      else clients.unshift(await api.insert("clients", v));
      draw(el); toast("Saved");
    },
    onDelete: c ? async () => { await api.remove("clients", c.id); clients = clients.filter((x) => x.id !== c.id); draw(el); toast("Deleted"); } : null,
  });
}
