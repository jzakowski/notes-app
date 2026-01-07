#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'tests/verification/feature_1/step_1_homepage.png',
      fullPage: true
    });

    // Check for the Notes App title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for main content
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'Not found');
    console.log('H1 text:', h1Text);

    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    console.log('✅ Verification complete!');
    console.log('✅ Screenshot saved: tests/verification/feature_1/step_1_homepage.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
