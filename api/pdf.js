import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
        });

        const page = await browser.newPage();

        await page.setContent(req.body.html, {
            waitUntil: "networkidle0",
        });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
        });

        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=bill.pdf"
        );

        return res.send(pdf);
    } catch (err) {
        console.error("PDF ERROR:", err);
        return res.status(500).json({
            error: err.message || "PDF generation failed",
        });
    }
}
