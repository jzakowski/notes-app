/**
 * Simple manual test - open browser and wait for manual interaction
 */

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const chromePath = path.join(
    process.env.HOME,
    '.cache/puppeteer/chrome/mac_arm-144.0.7559.31/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  );

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('🧪 Manual Dev Login Test');
  console.log('Browser will stay open for 30 seconds for manual testing...\n');

  // Go to login page
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });

  console.log('Please try logging in manually with:');
  console.log('  Email: dev@notes-app.local');
  console.log('  Password: dev123456');
  console.log('\nOr click the Quick Dev Login button\n');

  // Wait for 30 seconds to allow manual testing
  await page.waitForTimeout(30000);

  // Check where we ended up
  const url = page.url();
  console.log('\nCurrent URL:', url);

  if (url.includes('/notes')) {
    console.log('✅ Login successful!');
  } else {
    console.log('❌ Login failed - still on login page');
  }

  await browser.close();
})();
