import puppeteer from 'puppeteer';

export async function scrapeWebsite(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.setViewport({ width: 1280, height: 800 });

    console.log(`[Scraper] Navigating to: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    const data = await page.evaluate(() => {
      const getMeta = (name) => {
        const element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return element ? element.getAttribute('content') : null;
      };

      return {
        url: window.location.href,
        title: document.title,
        description: getMeta('description') || getMeta('og:description'),
        keywords: getMeta('keywords'),
        headings: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(Boolean),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()).filter(Boolean),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim()).filter(Boolean),
        },
        links: Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.trim(), href: a.href }))
          .filter(l => l.href.startsWith('http') && l.text.length > 0)
          .slice(0, 50), 
        images: Array.from(document.querySelectorAll('img'))
          .map(img => ({ alt: img.alt, src: img.src }))
          .filter(img => img.src.startsWith('http'))
          .slice(0, 20),
        textContent: document.body.innerText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 20) 
          .join('\n')
          .slice(0, 5000) 
      };
    });

    await browser.close();
    return { success: true, data };
  } catch (error) {
    if (browser) await browser.close();
    console.error(`[Scraper] Error scraping ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}

if (process.argv[2]) {
  const url = process.argv[2];
  scrapeWebsite(url).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
