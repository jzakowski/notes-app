#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Navigate to notes page
    console.log('Navigating to http://localhost:3003/notes...');
    await page.goto('http://localhost:3003/notes', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Page loaded!');

    // Wait a bit for any animations
    await page.waitForTimeout(2000);

    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'tests/verification/feature_25_verify/step_1_initial.png',
      fullPage: true
    });

    console.log('✅ SUCCESS! Screenshot saved to tests/verification/feature_25_verify/step_1_initial.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
