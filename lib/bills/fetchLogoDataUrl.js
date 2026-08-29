/**
 * Fetch a business logo (Cloudinary URL or /uploads path) and return it as
 * a `data:image/…;base64,…` URL suitable for jsPDF's addImage.
 *
 * Returns null on ANY failure — the PDF renderer falls back to a name-only
 * header. Bills should never fail to generate just because a logo fetch
 * blipped. Timeout is short (5s) for the same reason.
 */
export async function fetchLogoDataUrl(logoUrl) {
  if (!logoUrl) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(logoUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const contentType = (res.headers.get('content-type') || 'image/png').toLowerCase();
    // Only accept known-safe raster formats; jsPDF can't handle SVG etc.
    if (!/^image\/(png|jpe?g|webp)/.test(contentType)) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    // Guard against pathologically large logos (upload endpoint caps at 2MB
    // but a legacy value could bypass that). 3MB gives some slack.
    if (buffer.length > 3 * 1024 * 1024) return null;

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}
