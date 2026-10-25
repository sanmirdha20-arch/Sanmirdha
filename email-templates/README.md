# Email templates

| File | Purpose | Placeholders |
|---|---|---|
| `thank-you.html` | Auto-reply to a visitor after they submit the contact form | `{{name}}`, `{{project_type}}` |
| `new-inquiry-admin.html` | Notification to you when a new inquiry arrives | `{{name}}`, `{{email}}`, `{{project_type}}`, `{{budget}}`, `{{message}}`, `{{received_at}}`, `{{admin_url}}` |

The plain-text versions used by **Reply with a template** in the admin panel live in the database
(`email_templates` table) and can be edited from the admin panel under *Email templates*.

When sending automatically, **HTML-escape every value** before substituting it (`message` and `name` come from visitors).
