const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://example.com", {
        waitUntil: "networkidle2"
    });

    const data = await page.evaluate(() => {
        const title = document.querySelector("h1")?.innerText;
        const links = Array.from(document.querySelectorAll("a")).map(a => ({
            text: a.innerText,
            href: a.href
        }));

        return { title, links };
    });

    console.log(data);

    await browser.close();
})();