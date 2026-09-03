/**
 * Email-safe signature templates.
 *
 * Each template returns HTML built with tables + inline styles — the only
 * way to get consistent rendering across Gmail, Outlook, Apple Mail, and
 * mobile clients. Modern CSS (flex/grid) breaks in Outlook and gets
 * stripped by Gmail's sanitizer.
 *
 * TipTap compatibility: only block nodes TipTap knows about (paragraph)
 * appear inside <td>. We avoid <div> because TipTap's default schema has
 * no div node and would silently drop or reshape them, breaking the
 * two-column layout.
 *
 * Table structure uses explicit `width` on cells + `align="left"` on the
 * table so the two columns render side-by-side instead of stacking.
 */

const PLACEHOLDER_LOGO = 'https://placehold.co/120x120/e2e8f0/64748b?text=LOGO';

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const defaults = (input = {}) => ({
  name: input.name || 'Your Name',
  title: input.title || 'Your Title',
  company: input.company || 'Your Company',
  email: input.email || 'you@example.com',
  phone: input.phone || '+1 (555) 000-0000',
  website: input.website || 'www.example.com',
  address: input.address || 'City, Country',
  logoUrl: input.logoUrl || PLACEHOLDER_LOGO,
});

/** Two-column with vertical divider (Hostinger-style) */
function twoColumnDivider(input) {
  const v = defaults(input);
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Georgia,serif;color:#1e293b;font-size:13px;line-height:1.5;">
  <tbody>
    <tr>
      <td width="140" valign="top" style="width:140px;padding:4px 16px 4px 0;border-right:2px solid #c9a978;vertical-align:top;">
        <img src="${esc(v.logoUrl)}" width="120" alt="${esc(v.company)}" style="display:block;max-width:120px;height:auto;" />
      </td>
      <td valign="top" style="padding:4px 0 4px 16px;vertical-align:top;">
        <p style="margin:0;font-weight:bold;font-size:16px;color:#0f172a;">${esc(v.name)}</p>
        <p style="margin:2px 0 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#475569;">${esc(v.title)}</p>
        <p style="margin:6px 0 0;font-style:italic;color:#334155;">${esc(v.company)}</p>
        <p style="margin:10px 0 0;font-size:12px;color:#475569;">${esc(v.website)}</p>
        <p style="margin:0;font-size:12px;color:#475569;">${esc(v.email)}</p>
        <p style="margin:0;font-size:12px;color:#475569;">${esc(v.address)}</p>
      </td>
    </tr>
  </tbody>
</table>`;
}

/** Logo centered on top, details centered below */
function logoOnTop(input) {
  const v = defaults(input);
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;color:#1e293b;font-size:13px;text-align:center;">
  <tbody>
    <tr>
      <td align="center" style="padding-bottom:8px;text-align:center;">
        <img src="${esc(v.logoUrl)}" width="100" alt="${esc(v.company)}" style="display:inline-block;max-width:100px;height:auto;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="text-align:center;">
        <p style="margin:0;font-weight:bold;font-size:15px;color:#0f172a;">${esc(v.name)}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${esc(v.title)} · ${esc(v.company)}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#475569;">
          <a href="mailto:${esc(v.email)}" style="color:#2563eb;text-decoration:none;">${esc(v.email)}</a>
          &nbsp;·&nbsp; ${esc(v.phone)}
        </p>
        <p style="margin:0;font-size:12px;color:#475569;">${esc(v.website)}</p>
      </td>
    </tr>
  </tbody>
</table>`;
}

/** Minimal — text only, no logo, single column */
function minimal(input) {
  const v = defaults(input);
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.5;">
  <tbody>
    <tr>
      <td valign="top">
        <p style="margin:0;font-weight:bold;font-size:14px;color:#0f172a;">${esc(v.name)}</p>
        <p style="margin:0;font-size:12px;color:#64748b;">${esc(v.title)} · ${esc(v.company)}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#475569;">
          <a href="mailto:${esc(v.email)}" style="color:#2563eb;text-decoration:none;">${esc(v.email)}</a> · ${esc(v.phone)}
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
}

/** Corporate — logo on left, details on right, no divider */
function corporate(input) {
  const v = defaults(input);
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.5;">
  <tbody>
    <tr>
      <td width="94" valign="middle" style="width:94px;padding-right:14px;vertical-align:middle;">
        <img src="${esc(v.logoUrl)}" width="80" alt="${esc(v.company)}" style="display:block;max-width:80px;height:auto;border-radius:6px;" />
      </td>
      <td valign="middle" style="vertical-align:middle;">
        <p style="margin:0;font-weight:600;font-size:15px;color:#0f172a;">${esc(v.name)}</p>
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">${esc(v.title)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#475569;"><strong style="color:#0f172a;">${esc(v.company)}</strong> · ${esc(v.website)}</p>
        <p style="margin:0;font-size:12px;color:#475569;">
          <a href="mailto:${esc(v.email)}" style="color:#2563eb;text-decoration:none;">${esc(v.email)}</a> · ${esc(v.phone)}
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
}

export const SIGNATURE_TEMPLATES = [
  {
    id: 'two-column-divider',
    label: 'Two-column with divider',
    description: 'Logo left, vertical divider, details right',
    render: twoColumnDivider,
  },
  {
    id: 'logo-on-top',
    label: 'Logo on top',
    description: 'Centered logo above name and contact',
    render: logoOnTop,
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Logo left, bold name and role right',
    render: corporate,
  },
  {
    id: 'minimal',
    label: 'Minimal (text only)',
    description: 'Just name, title, and contact — no logo',
    render: minimal,
  },
];

export function renderTemplate(id, input) {
  const tmpl = SIGNATURE_TEMPLATES.find((t) => t.id === id);
  if (!tmpl) return '';
  return tmpl.render(input || {});
}

export { PLACEHOLDER_LOGO };
