const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/**
 * Standardized API path for PDF generation
 * Matches the Vercel serverless function path
 */
app.post('/api/pdf', async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'Missing HTML content' });
    }

    try {
        console.log('Generating PDF (Standard API Path)...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Ensure fonts/assets load
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="invoice.pdf"',
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
        console.log('PDF Generated Successfully');

    } catch (error) {
        console.error('PDF Generation Failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Legacy route for backward compatibility during transition
app.post('/generate-pdf', async (req, res) => {
    console.log('Legacy route called. Redirecting logic internally to /api/pdf...');
    req.url = '/api/pdf';
    app.handle(req, res);
});

app.listen(PORT, () => {
    console.log(`PDF Server running on http://localhost:${PORT}`);
});

