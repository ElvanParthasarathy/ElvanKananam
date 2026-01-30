const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001; // Avoid conflict with React (3000) or Vite (5173)

// Middleware
app.use(cors());
// Huge limit to allow full base64 images or large HTML payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/**
 * POST /generate-pdf
 * Expects JSON body: { html: "<html>...</html>" }
 * Returns: PDF Buffer
 */
app.post('/generate-pdf', async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).send('Missing HTML content');
    }

    try {
        console.log('Generating PDF...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // For Docker/Server stability
        });
        const page = await browser.newPage();

        // simple timeout to ensure assets load
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // IMPORTANT for CSS background-color/images
            margin: {
                top: '0mm', // We control margins in CSS/HTML
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });

        await browser.close();

        // Send PDF as binary stream
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="invoice.pdf"',
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
        console.log('PDF Generated Successfully');

    } catch (error) {
        console.error('PDF Generation Failed:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(PORT, () => {
    console.log(`PDF Server running on http://localhost:${PORT}`);
});
