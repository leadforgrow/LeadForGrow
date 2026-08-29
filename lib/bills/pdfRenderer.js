import { jsPDF } from 'jspdf';

/**
 * Render a bill to a PDF Buffer using jsPDF.
 *
 * Deliberately simple layout:
 *   - Header: business logo (if uploaded) + business name (big), business
 *     phone + address (small right side)
 *   - Metadata block: bill number, date, "Billed to" customer block
 *   - Line-item table with description / qty / rate / amount columns
 *   - Totals right-aligned: subtotal, discount, tax (if any), total
 *   - Footer: notes + GST number if provided
 *
 * Explicitly does NOT stamp any LeadForGrow branding. This is the business's
 * customer-facing document — every pixel represents them, not us.
 *
 * @param logoDataUrl - Optional data URL of the business logo. When present,
 *   drawn top-left with the business name shifted right. The caller (send /
 *   pdf route) is responsible for fetching business.logo and converting to
 *   a data URL before calling — the renderer stays synchronous.
 */
export function renderBillPdf({ bill, business, logoDataUrl }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN = 40;
  const RIGHT_EDGE = PAGE_W - MARGIN;

  const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const line = (y) => doc.line(MARGIN, y, RIGHT_EDGE, y);

  // ── Header — logo (if any) + business identity ────────────────────────
  // Logo box is a fixed 60x60pt square with the image drawn to fit while
  // preserving aspect ratio. Falls back to name-only if the image fails.
  let nameLeft = MARGIN;
  if (logoDataUrl) {
    try {
      // Detect format from the data-url prefix — jsPDF wants an explicit
      // format ('PNG' | 'JPEG' | 'WEBP') as the second arg
      const fmtMatch = /^data:image\/(png|jpe?g|webp)/i.exec(logoDataUrl);
      const jsPdfFmt = fmtMatch ? fmtMatch[1].toUpperCase().replace('JPG', 'JPEG') : 'PNG';
      const props = doc.getImageProperties(logoDataUrl);
      const maxSide = 55;
      const ratio = props.width / props.height;
      const w = ratio >= 1 ? maxSide : maxSide * ratio;
      const h = ratio >= 1 ? maxSide / ratio : maxSide;
      // Vertically centre the logo against a 60pt logical row starting at y=30
      const y = 30 + (maxSide - h) / 2;
      doc.addImage(logoDataUrl, jsPdfFmt, MARGIN, y, w, h);
      nameLeft = MARGIN + w + 12;
    } catch {
      // Bad image data — skip the logo, keep the layout usable
      nameLeft = MARGIN;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text(business.businessName || 'Business', nameLeft, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const contactLines = [
    business.phone || '',
    business.email || '',
    business.address || '',
  ].filter(Boolean);
  let y = 55;
  contactLines.forEach((str) => {
    doc.text(str, RIGHT_EDGE, y, { align: 'right' });
    y += 12;
  });

  // Rule under the header
  doc.setDrawColor(226, 232, 240);
  line(90);

  // ── Metadata block — bill number, date, billed-to ─────────────────────
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('BILL', MARGIN, 115);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(String(bill.billNumber || ''), MARGIN, 133);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, MARGIN, 149);

  // Billed-to on the right
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO', RIGHT_EDGE, 115, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text(String(bill.customerName || ''), RIGHT_EDGE, 133, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  if (bill.customerPhone) doc.text(bill.customerPhone, RIGHT_EDGE, 149, { align: 'right' });
  if (bill.customerEmail) doc.text(bill.customerEmail, RIGHT_EDGE, 161, { align: 'right' });

  // ── Line-item table ────────────────────────────────────────────────────
  let tableY = 195;

  // Table header row (gray bg)
  doc.setFillColor(243, 244, 246);
  doc.rect(MARGIN, tableY, RIGHT_EDGE - MARGIN, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text('DESCRIPTION',       MARGIN + 10, tableY + 15);
  doc.text('QTY',                RIGHT_EDGE - 220, tableY + 15, { align: 'right' });
  doc.text('RATE',               RIGHT_EDGE - 110, tableY + 15, { align: 'right' });
  doc.text('AMOUNT',             RIGHT_EDGE - 10, tableY + 15, { align: 'right' });

  tableY += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);

  for (const item of bill.lineItems || []) {
    // Wrap long descriptions to multiple lines within a max width
    const desc = String(item.description || '');
    const wrapped = doc.splitTextToSize(desc, RIGHT_EDGE - MARGIN - 260);
    const rowH = Math.max(20, wrapped.length * 12 + 8);
    doc.text(wrapped, MARGIN + 10, tableY + 14);
    doc.text(String(item.quantity ?? 1), RIGHT_EDGE - 220, tableY + 14, { align: 'right' });
    doc.text(fmt(item.rate), RIGHT_EDGE - 110, tableY + 14, { align: 'right' });
    doc.text(fmt(item.amount), RIGHT_EDGE - 10, tableY + 14, { align: 'right' });
    tableY += rowH;

    // Row divider
    doc.setDrawColor(241, 245, 249);
    line(tableY);
  }

  // ── Totals block, right-aligned ────────────────────────────────────────
  tableY += 20;
  const totalsLabelX = RIGHT_EDGE - 150;
  const totalsValueX = RIGHT_EDGE - 10;
  doc.setFontSize(10);

  const putRow = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(bold ? 17 : 100, bold ? 24 : 116, bold ? 39 : 139);
    doc.text(label, totalsLabelX, tableY, { align: 'right' });
    doc.text(value, totalsValueX, tableY, { align: 'right' });
    tableY += 18;
  };

  putRow('Subtotal', fmt(bill.subtotal));
  if (Number(bill.discount) > 0) putRow('Discount', `- ${fmt(bill.discount)}`);
  if (Number(bill.taxRate) > 0) putRow(`Tax (${bill.taxRate}%)`, fmt(bill.taxAmount));

  // Grand total — heavier, with rule above. The rule sits a few points below
  // the last row's baseline, then we drop a full line height before drawing
  // TOTAL so the rule doesn't cross through the (larger, bold) total text.
  tableY += 6;
  doc.setDrawColor(17, 24, 39);
  doc.setLineWidth(1);
  doc.line(totalsLabelX - 20, tableY, totalsValueX, tableY);
  doc.setLineWidth(0.5);
  tableY += 18;
  doc.setFontSize(13);
  putRow('TOTAL', fmt(bill.total), true);

  // ── Footer — notes + GST info ──────────────────────────────────────────
  let footerY = tableY + 40;
  if (bill.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text('NOTES', MARGIN, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(String(bill.notes), RIGHT_EDGE - MARGIN);
    doc.text(wrapped, MARGIN, footerY + 14);
    footerY += 14 + wrapped.length * 12 + 20;
  }
  // Prefer per-bill GSTIN (rare — only when the owner intentionally set a
  // different one on this bill), else fall back to the business's own GSTIN
  // from the header settings. Prints once in the footer.
  const effectiveGstin = (bill.gstNumber && bill.gstNumber.trim()) || business.gstin || '';
  if (effectiveGstin) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`GSTIN: ${effectiveGstin}`, MARGIN, footerY);
  }

  // "Thank you" flourish at the bottom
  const bottomY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business.', PAGE_W / 2, bottomY, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
