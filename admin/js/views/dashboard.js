import { api } from "../api.js";
import { html, fmtINR, fmtDateTime, badge, empty } from "../ui.js";

export async function render(el) {
  const [subs, leads, projects, reminders, clients] = await Promise.all([
    api.list("contact_submissions"),
    api.list("leads"),
    api.list("client_projects"),
    api.list("reminders", { order: "due_at", asc: true }),
    api.list("clients"),
  ]);

  const newSubs = subs.filter((s) => s.status === "new");
  const openLeads = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const pipeline = openLeads.reduce((n, l) => n + Number(l.value_inr || 0), 0);
  const won = leads.filter((l) => l.stage === "won").reduce((n, l) => n + Number(l.value_inr || 0), 0);
  const activeProjects = projects.filter((p) => ["planning", "in_progress", "review"].includes(p.status));
  const outstanding = projects.reduce((n, p) => n + Math.max(0, Number(p.budget_inr || 0) - Number(p.paid_inr || 0)), 0);
  const dueReminders = reminders.filter((r) => !r.done && new Date(r.due_at) <= new Date(Date.now() + 86400000));
  const upcoming = reminders.filter((r) => !r.done).slice(0, 5);

  const stat = (value, name, sub = "") => html`<div class="stat"><div class="stat-value">${value}</div><div class="stat-name">${name}</div>${sub ? html`<div class="stat-sub">${sub}</div>` : ""}</div>`;

  el.innerHTML = html`
    <div class="stats">
      ${stat(newSubs.length, "New inquiries", `${subs.length} total`)}
      ${stat(openLeads.length, "Open leads", `Pipeline ${fmtINR(pipeline)}`)}
      ${stat(activeProjects.length, "Active projects", `Outstanding ${fmtINR(outstanding)}`)}
      ${stat(dueReminders.length, "Reminders due", "today or overdue")}
      ${stat(fmtINR(won), "Won (all time)", `${clients.length} client${clients.length === 1 ? "" : "s"}`)}
    </div>
    <div class="two-col">
      <section class="card">
        <div class="card-head"><h3>Latest inquiries</h3><a href="#/inquiries">View all →</a></div>
        ${subs.length ? html`<ul class="list">${subs.slice(0, 6).map((s) => html`
          <li><a href="#/inquiries?open=${s.id}"><strong>${s.name}</strong> <span class="muted">· ${s.project_type}</span>
            <div class="muted small">${fmtDateTime(s.created_at)}</div></a>${badge(s.status)}</li>`)}</ul>` : empty("No inquiries yet. They will appear here when someone uses your contact form.")}
      </section>
      <section class="card">
        <div class="card-head"><h3>Upcoming reminders</h3><a href="#/reminders">View all →</a></div>
        ${upcoming.length ? html`<ul class="list">${upcoming.map((r) => html`
          <li><span>${r.title}<div class="muted small ${new Date(r.due_at) < new Date() ? "overdue" : ""}">${fmtDateTime(r.due_at)}</div></span></li>`)}</ul>` : empty("Nothing scheduled. Add a follow-up reminder for each lead.")}
      </section>
    </div>`.toString();
}
