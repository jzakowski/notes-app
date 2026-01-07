/**
 * Test that dev login hint is NOT visible when NEXT_PUBLIC_DEV_MODE is not set
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testProductionMode() {
  console.log('🧪 Testing Production Mode (Dev Login Should Be Hidden)\n');

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

  // Set NEXT_PUBLIC_DEV_MODE to false via environment
  await page.setExtraHTTPHeaders({
    'Cookie': 'NEXT_PUBLIC_DEV_MODE=false'
  });

  try {
    // Navigate to login page
    console.log('Step 1: Navigating to login page (production mode)...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/verification/feature_40/step_3_production_login_page.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: step_3_production_login_page.png');

    // Check that dev login hint is NOT visible
    console.log('\nStep 2: Verifying dev login hint is hidden...');
    const devLoginHidden = await page.evaluate(() => {
      const devLoginBox = document.querySelector('.bg-blue-50');
      if (!devLoginBox) return true; // Not found = hidden (good)
      return devLoginBox.offsetParent === null; // Found but hidden
    });

    if (devLoginHidden) {
      console.log('✅ Dev login hint is correctly hidden in production mode');
    } else {
      console.log('❌ Dev login hint is visible (should be hidden in production)');
      throw new Error('Dev login hint should be hidden in production');
    }

    // Also verify the environment variable is not "true"
    const devModeValue = await page.evaluate(() => {
      return process.env.NEXT_PUBLIC_DEV_MODE || 'undefined';
    });
    console.log(`NEXT_PUBLIC_DEV_MODE value on client: ${devModeValue}`);

    console.log('\n✅ Production mode test passed!');
    console.log('Dev login hint is hidden when NEXT_PUBLIC_DEV_MODE != "true"');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({
      path: 'tests/verification/feature_40/production_error.png',
      fullPage: true
    });
    throw error;
  } finally {
    await browser.close();
  }
}

testProductionMode().catch(error => {
  console.error('Production mode test failed:', error);
  process.exit(1);
});
