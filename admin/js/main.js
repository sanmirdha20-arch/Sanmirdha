import { sb, api } from "./api.js";
import { html, $, $$, toast } from "./ui.js";

const ROUTES = {
  dashboard: { title: "Dashboard", icon: "▦", load: () => import("./views/dashboard.js") },
  inquiries: { title: "Inquiries", icon: "✉", load: () => import("./views/inquiries.js") },
  leads: { title: "Leads", icon: "◎", load: () => import("./views/leads.js") },
  clients: { title: "Clients", icon: "☺", load: () => import("./views/clients.js") },
  projects: { title: "Projects", icon: "▤", load: () => import("./views/projects.js") },
  reminders: { title: "Reminders", icon: "⏰", load: () => import("./views/reminders.js") },
  templates: { title: "Email templates", icon: "✎", load: () => import("./views/templates.js") },
};

const app = $("#app");
let session = null;

function showLogin(message = "") {
  document.title = "Sign in · San's Admin";
  app.innerHTML = html`
    <main class="login">
      <form id="login" class="login-card" novalidate>
        <div class="brand">San<span>.</span> <small>Admin</small></div>
        <h1>Sign in</h1>
        <p class="muted">Private area. Authorised users only.</p>
        ${message ? html`<div class="alert" role="alert">${message}</div>` : ""}
        <div class="field full"><label for="email">Email</label><input id="email" type="email" autocomplete="username" required></div>
        <div class="field full"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required></div>
        <button class="primary block" type="submit">Sign in</button>
      </form>
    </main>`.toString();
  const form = $("#login");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $("button", form);
    btn.disabled = true; btn.textContent = "Signing in…";
    const { error } = await sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value });
    if (error) { showLogin("Incorrect email or password."); return; }
    await boot();
  });
}

function showShell(email) {
  app.innerHTML = html`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">San<span>.</span> <small>Admin</small></div>
        <nav aria-label="Main">${Object.entries(ROUTES).map(([k, r]) => html`<a href="#/${k}" data-route="${k}"><span class="ico" aria-hidden="true">${r.icon}</span>${r.title}</a>`)}</nav>
        <div class="sidebar-foot"><div class="muted small ellipsis" title="${email}">${email}</div>
          <button class="ghost block" id="logout">Sign out</button></div>
      </aside>
      <main class="main"><header class="topbar"><h1 id="page-title"></h1></header><div id="view" aria-live="polite"></div></main>
    </div>`.toString();
  $("#logout").addEventListener("click", async () => { await sb.auth.signOut(); location.hash = ""; showLogin(); });
}

async function route() {
  if (!session) return;
  const [path, query = ""] = location.hash.replace(/^#\//, "").split("?");
  const key = ROUTES[path] ? path : "dashboard";
  $$("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === key));
  $("#page-title").textContent = ROUTES[key].title;
  document.title = `${ROUTES[key].title} · San's Admin`;
  const view = $("#view");
  view.innerHTML = `<div class="loading">Loading…</div>`;
  try {
    const mod = await ROUTES[key].load();
    await mod.render(view, { params: new URLSearchParams(query) });
  } catch (err) {
    console.error(err);
    view.innerHTML = html`<div class="empty"><strong>Couldn't load this page.</strong><div class="muted">${err.message}</div></div>`.toString();
  }
}

async function boot() {
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (!session) return showLogin();
  let ok = false;
  try { ok = await api.isAdmin(); } catch { /* treated as not admin */ }
  if (!ok) {
    await sb.auth.signOut();
    session = null;
    return showLogin("This account is not authorised for the admin panel.");
  }
  showShell(session.user.email);
  route();
}

window.addEventListener("hashchange", route);
sb.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT" && session) { session = null; showLogin("You were signed out."); } });
boot().catch((e) => { console.error(e); showLogin("Could not reach the server. Please try again."); });
window.addEventListener("unhandledrejection", (e) => toast(e.reason?.message || "Unexpected error", "error"));
