export function chunkText(text, { chunkSize = 800, overlap = 100 } = {}) {
  if (!text?.trim()) return [];
  const chunks = [];
  let start = 0;
  const clean = text.replace(/\r\n/g, '\n').trim();

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const breakAt = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '));
      if (breakAt > chunkSize * 0.4) end = start + breakAt + 1;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    start = end - overlap;
    if (start < 0) start = 0;
    if (end >= clean.length) break;
  }
  return chunks;
}

export function extractTextFromBuffer(buffer, mimeType = '', fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (mimeType === 'text/plain' || ext === 'txt' || ext === 'md' || ext === 'csv') {
    return buffer.toString('utf-8');
  }
  // Basic PDF text extraction — printable ASCII runs
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/[\x20-\x7E\n\r\t]{20,}/g) || [];
    return matches.join('\n').replace(/\s+/g, ' ').trim();
  }
  return buffer.toString('utf-8', 0, Math.min(buffer.length, 500000));
}

export async function crawlWebsite(url) {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const data = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      text: document.body?.innerText?.slice(0, 50000) || '',
    }));
    return { ...data, url };
  } finally {
    await browser.close();
  }
}

export default { chunkText, extractTextFromBuffer, crawlWebsite };
