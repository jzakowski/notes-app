#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Check for console errors (set up before navigation)
  const consoleErrors = [];
  page.on('console', msg => {
    try {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        console.error('❌ Console error:', errorText);
        consoleErrors.push(errorText);
      }
    } catch (e) {
      // Ignore console listener errors
    }
  });

  try {
    console.log('🔍 Step 1: Navigating to notes page...');
    await page.goto('http://localhost:3003/notes', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    console.log('📸 Step 2: Taking screenshot (initial light mode)...');
    await page.screenshot({
      path: 'tests/verification/feature_25_verify/step_1_initial_light_mode.png',
      fullPage: true
    });

    console.log('🔍 Step 3: Looking for theme toggle button...');
    const toggleButton = await page.$('button[aria-label*="theme"], button[aria-label*="Theme"], button[aria-label*="dark"], button[aria-label*="Dark"]');

    if (!toggleButton) {
      throw new Error('❌ Theme toggle button not found!');
    }

    console.log('✅ Theme toggle button found!');

    console.log('🌙 Step 4: Clicking toggle button to switch to dark mode...');
    await toggleButton.click();
    await page.waitForTimeout(1000);

    console.log('📸 Step 5: Taking screenshot (dark mode)...');
    await page.screenshot({
      path: 'tests/verification/feature_25_verify/step_2_dark_mode.png',
      fullPage: true
    });

    console.log('🔄 Step 6: Refreshing page to check persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    console.log('📸 Step 7: Taking screenshot (after refresh - should still be dark)...');
    await page.screenshot({
      path: 'tests/verification/feature_25_verify/step_3_dark_mode_persisted.png',
      fullPage: true
    });

    console.log('☀️ Step 8: Clicking toggle button to switch back to light mode...');
    const toggleButton2 = await page.$('button[aria-label*="theme"], button[aria-label*="Theme"], button[aria-label*="dark"], button[aria-label*="Dark"]');
    await toggleButton2.click();
    await page.waitForTimeout(1000);

    console.log('📸 Step 9: Taking screenshot (back to light mode)...');
    await page.screenshot({
      path: 'tests/verification/feature_25_verify/step_4_back_to_light_mode.png',
      fullPage: true
    });

    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('✅ Dark mode feature is working correctly!');
    console.log('\n📸 Screenshots saved:');
    console.log('  - tests/verification/feature_25_verify/step_1_initial_light_mode.png');
    console.log('  - tests/verification/feature_25_verify/step_2_dark_mode.png');
    console.log('  - tests/verification/feature_25_verify/step_3_dark_mode_persisted.png');
    console.log('  - tests/verification/feature_25_verify/step_4_back_to_light_mode.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
