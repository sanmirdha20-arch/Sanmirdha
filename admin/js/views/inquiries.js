import { api } from "../api.js";
import { MY_NAME, SUBMISSION_STATUSES } from "../config.js";
import { html, raw, $, $$, fmtDateTime, badge, empty, label, openModal, closeModal, toast } from "../ui.js";

let state = { subs: [], templates: [], filter: "all", q: "" };

export const fillTemplate = (text, s) =>
  String(text)
    .replaceAll("{{name}}", s.name.split(" ")[0] || s.name)
    .replaceAll("{{full_name}}", s.name)
    .replaceAll("{{project_type}}", String(s.project_type).toLowerCase())
    .replaceAll("{{budget}}", s.budget || "your budget")
    .replaceAll("{{message}}", s.message)
    .replaceAll("{{my_name}}", MY_NAME);

export const gmailUrl = (to, subject, body) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export async function render(el, { params }) {
  state.q = ""; state.filter = "all"; // fresh view on every visit
  [state.subs, state.templates] = await Promise.all([api.list("contact_submissions"), api.list("email_templates", { order: "sort_order", asc: true })]);
  draw(el);
  if (params.get("open")) {
    const s = state.subs.find((x) => x.id === params.get("open"));
    if (s) openDetail(s, el);
  }
}

function draw(el) {
  const counts = Object.fromEntries(SUBMISSION_STATUSES.map((st) => [st, state.subs.filter((s) => s.status === st).length]));
  const q = state.q.toLowerCase();
  const rows = state.subs.filter((s) => (state.filter === "all" || s.status === state.filter) &&
    (!q || `${s.name} ${s.email} ${s.message} ${s.project_type}`.toLowerCase().includes(q)));

  el.innerHTML = html`
    <div class="toolbar">
      <div class="tabs" role="tablist">
        ${["all", ...SUBMISSION_STATUSES].map((f) => html`<button role="tab" class="tab ${state.filter === f ? "active" : ""}" data-filter="${f}">${label(f)}${f !== "all" && counts[f] ? html` <span class="count">${counts[f]}</span>` : ""}</button>`)}
      </div>
      <input type="search" id="q" placeholder="Search name, email, message…" value="${state.q}" aria-label="Search inquiries">
    </div>
    ${rows.length ? html`<div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Project</th><th>Budget</th><th>Received</th><th>Status</th></tr></thead>
      <tbody>${rows.map((s) => html`<tr class="clickable" data-id="${s.id}" tabindex="0">
        <td><strong>${s.name}</strong><div class="muted small">${s.email}</div></td>
        <td>${s.project_type}<div class="muted small clamp">${s.message}</div></td>
        <td>${s.budget ?? "—"}</td><td>${fmtDateTime(s.created_at)}</td><td>${badge(s.status)}</td></tr>`)}</tbody></table></div>`
      : empty(state.subs.length ? "No inquiries match this filter." : "No inquiries yet. They will appear here when someone uses your contact form.")}`.toString();

  $$("[data-filter]", el).forEach((b) => b.addEventListener("click", () => { state.filter = b.dataset.filter; draw(el); }));
  const q$ = $("#q", el);
  q$.addEventListener("input", () => { state.q = q$.value; const pos = q$.selectionStart; draw(el); const n = $("#q", el); n.focus(); n.setSelectionRange(pos, pos); });
  $$("tr.clickable", el).forEach((tr) => {
    const open = () => openDetail(state.subs.find((s) => s.id === tr.dataset.id), el);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  });
}

async function patch(s, changes, el) {
  const updated = await api.update("contact_submissions", s.id, changes);
  Object.assign(s, updated);
  draw(el);
}

function openDetail(s, el) {
  // Opening a new inquiry marks it as read.
  if (s.status === "new") patch(s, { status: "read" }, el).catch(() => {});

  const modal = openModal(html`
    <header><h2>${s.name}</h2><button class="icon-btn" data-close aria-label="Close">✕</button></header>
    <div class="detail">
      <dl>
        <dt>Email</dt><dd><a href="mailto:${s.email}">${s.email}</a></dd>
        <dt>Project</dt><dd>${s.project_type}</dd>
        <dt>Budget</dt><dd>${s.budget ?? "—"}</dd>
        <dt>Received</dt><dd>${fmtDateTime(s.created_at)}</dd>
      </dl>
      <div class="message">${s.message}</div>
      <div class="field full"><label for="status">Status</label>
        <select id="status">${SUBMISSION_STATUSES.map((st) => html`<option value="${st}" ${st === (s.status === "new" ? "read" : s.status) ? raw("selected") : ""}>${label(st)}</option>`)}</select></div>
      <div class="field full"><label for="notes">Private notes</label><textarea id="notes" rows="3" maxlength="4000">${s.notes ?? ""}</textarea></div>
      <div class="reply-box">
        <label for="tpl">Reply with a template</label>
        <div class="row">
          <select id="tpl">${state.templates.map((t) => html`<option value="${t.id}">${t.name}</option>`)}</select>
          <button class="primary" id="reply">Open in Gmail ↗</button>
        </div>
        <label class="check"><input type="checkbox" id="mark" checked> Mark as replied</label>
        <p class="muted small">Opens a pre-filled Gmail draft. You can edit it before sending. Edit templates under “Email templates”.</p>
      </div>
    </div>
    <footer>
      <button class="danger" id="del">Delete</button><span class="spacer"></span>
      <button class="ghost" id="to-lead">Convert to lead</button>
      <button class="primary" id="save">Save</button>
    </footer>`, { wide: true });

  $("#save", modal).addEventListener("click", async () => {
    try {
      await patch(s, { status: $("#status", modal).value, notes: $("#notes", modal).value.trim() || null }, el);
      toast("Saved"); closeModal();
    } catch (e) { toast(e.message, "error"); }
  });

  $("#reply", modal).addEventListener("click", async () => {
    const t = state.templates.find((x) => x.id === $("#tpl", modal).value);
    if (!t) return toast("Create an email template first", "error");
    window.open(gmailUrl(s.email, fillTemplate(t.subject, s), fillTemplate(t.body, s)), "_blank", "noopener");
    if ($("#mark", modal).checked && s.status !== "converted") {
      try { await patch(s, { status: "replied" }, el); } catch (e) { toast(e.message, "error"); }
    }
  });

  $("#to-lead", modal).addEventListener("click", async () => {
    try {
      const clients = await api.list("clients");
      let client = clients.find((c) => c.email && c.email.toLowerCase() === s.email.toLowerCase());
      if (!client) client = await api.insert("clients", { name: s.name, email: s.email, source: "Website contact form" });
      await api.insert("leads", {
        client_id: client.id, submission_id: s.id, stage: "new",
        title: `${s.project_type} project: ${s.name}`, notes: s.message,
      });
      await patch(s, { status: "converted" }, el);
      toast("Lead created. Find it under Leads."); closeModal();
    } catch (e) { toast(e.message, "error"); }
  });

  $("#del", modal).addEventListener("click", async () => {
    if (!confirm("Delete this inquiry permanently?")) return;
    try {
      await api.remove("contact_submissions", s.id);
      state.subs = state.subs.filter((x) => x.id !== s.id);
      draw(el); closeModal(); toast("Deleted");
    } catch (e) { toast(e.message, "error"); }
  });
}
