import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import { withPlanAccess } from '@/lib/accessControl';

const HEADER_ALIASES = {
  name: ['name', 'full name', 'fullname', 'contact name', 'lead name', 'customer name'],
  phone: ['phone', 'phone number', 'mobile', 'mobile number', 'whatsapp', 'whatsapp number', 'number', 'contact', 'contact number'],
  email: ['email', 'email address', 'e-mail', 'mail'],
};

function matchColumn(headers, aliases) {
  const lower = headers.map((h) => String(h || '').trim().toLowerCase());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

function cleanPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits; // India default; UI can add country picker later
  return digits;
}

async function parseCsv(buffer) {
  const text = buffer.toString('utf8');
  const { data } = Papa.parse(text, { skipEmptyLines: true });
  if (!data.length) return { headers: [], rows: [] };
  const [headers, ...rows] = data;
  return { headers, rows };
}

async function parseXlsx(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };
  const headers = [];
  const rows = [];
  ws.eachRow((row, rowNumber) => {
    const values = row.values.slice(1); // exceljs uses 1-indexed
    if (rowNumber === 1) {
      values.forEach((v) => headers.push(v));
    } else {
      rows.push(values.map((v) => (v && typeof v === 'object' && 'text' in v ? v.text : v)));
    }
  });
  return { headers, rows };
}

/**
 * POST /api/automation/broadcasts/import-csv
 *
 * Multipart body: file, dryRun?, campaignName?
 *
 * dryRun=1 → parses + validates, returns preview without touching DB.
 * dryRun absent → creates/updates leads, tags them with `campaign_<slug>_<timestamp>`,
 *                 returns { leadIds, tag, valid, invalid, duplicates }.
 */
export const POST = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;

    const form = await req.formData();
    const file = form.get('file');
    const dryRun = form.get('dryRun') === '1' || form.get('dryRun') === 'true';
    const campaignName = String(form.get('campaignName') || 'broadcast').trim();

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name || '').split('.').pop()?.toLowerCase();

    let parsed;
    if (ext === 'xlsx' || ext === 'xlsm' || ext === 'xltx') {
      parsed = await parseXlsx(buffer);
    } else {
      parsed = await parseCsv(buffer);
    }

    if (!parsed.headers?.length || !parsed.rows?.length) {
      return NextResponse.json({ success: false, error: 'File is empty or unreadable' }, { status: 400 });
    }

    const nameIdx = matchColumn(parsed.headers, HEADER_ALIASES.name);
    const phoneIdx = matchColumn(parsed.headers, HEADER_ALIASES.phone);
    const emailIdx = matchColumn(parsed.headers, HEADER_ALIASES.email);

    if (phoneIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'No phone column found. Expected one of: phone, mobile, whatsapp, number',
          detectedHeaders: parsed.headers,
        },
        { status: 400 },
      );
    }

    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < parsed.rows.length; i += 1) {
      const row = parsed.rows[i];
      const phone = cleanPhone(row[phoneIdx]);
      if (!phone || phone.length < 10) {
        invalidRows.push({ row: i + 2, reason: 'Invalid phone', raw: row[phoneIdx] });
        continue;
      }
      const name = String(row[nameIdx] || '').trim() || `Lead ${phone.slice(-4)}`;
      const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim().toLowerCase() : '';
      validRows.push({ name, phone, email });
    }

    // Duplicate detection inside the file
    const seen = new Set();
    const dedupedRows = [];
    let intraFileDupes = 0;
    for (const r of validRows) {
      if (seen.has(r.phone)) {
        intraFileDupes += 1;
        continue;
      }
      seen.add(r.phone);
      dedupedRows.push(r);
    }

    const preview = dedupedRows.slice(0, 5);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        detectedHeaders: parsed.headers,
        mapping: { name: nameIdx, phone: phoneIdx, email: emailIdx },
        totalRows: parsed.rows.length,
        valid: dedupedRows.length,
        invalid: invalidRows.length,
        duplicates: intraFileDupes,
        preview,
      });
    }

    // Real import — upsert leads by phone within this business, tag them.
    const slug = campaignName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) || 'broadcast';
    const tag = `campaign_${slug}_${Date.now()}`;

    const leadIds = [];
    let created = 0;
    let updated = 0;

    for (const r of dedupedRows) {
      const existing = await Lead.findOne({ businessId, phone: r.phone });
      if (existing) {
        const nextTags = Array.from(new Set([...(existing.tags || []), tag]));
        existing.tags = nextTags;
        if (!existing.email && r.email) existing.email = r.email;
        await existing.save();
        leadIds.push(existing._id);
        updated += 1;
      } else {
        const doc = await Lead.create({
          businessId,
          name: r.name,
          phone: r.phone,
          email: r.email || undefined,
          source: 'csv_import',
          status: 'new_lead',
          tags: [tag],
        });
        leadIds.push(doc._id);
        created += 1;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      tag,
      leadIds,
      created,
      updated,
      valid: dedupedRows.length,
      invalid: invalidRows.length,
      duplicates: intraFileDupes,
    });
  } catch (error) {
    console.error('[csv-import] failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const runtime = 'nodejs';
export const maxDuration = 60;
