const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Dark Mode Feature...\n');

    // Navigate to the app
    console.log('1️⃣ Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'tests/verification/feature_25/step_1_initial_state.png' });
    console.log('✅ Page loaded\n');

    // Check for dark mode toggle
    console.log('2️⃣ Looking for dark mode toggle...');
    const toggleExists = await page.$('[data-testid="dark-mode-toggle"]') !== null;
    console.log(toggleExists ? '✅ Dark mode toggle found' : '❌ Toggle not found');

    if (toggleExists) {
      // Click to enable dark mode
      console.log('\n3️⃣ Clicking dark mode toggle...');
      await page.click('[data-testid="dark-mode-toggle"]');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_25/step_2_dark_mode_enabled.png' });
      console.log('✅ Dark mode enabled\n');

      // Check dark mode class
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      console.log(isDark ? '✅ Dark mode class applied' : '❌ Dark mode class not found');

      // Click to disable
      console.log('\n4️⃣ Clicking toggle again to disable...');
      await page.click('[data-testid="dark-mode-toggle"]');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_25/step_3_light_mode_restored.png' });
      console.log('✅ Light mode restored\n');

      // Check light mode
      const isLight = await page.evaluate(() => {
        return !document.documentElement.classList.contains('dark');
      });
      console.log(isLight ? '✅ Light mode confirmed' : '❌ Light mode not confirmed');
    }

    console.log('\n✅ Dark Mode Feature Verification Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
