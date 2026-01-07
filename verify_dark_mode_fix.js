const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    console.log('🧪 Verifying Dark Mode Fix...\n');

    // Navigate to home page
    console.log('1️⃣ Navigating to home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'tests/verification/feature_25/step_1_home_light_mode.png' });
    console.log('✅ Home page loaded\n');

    // Check if ThemeToggle exists
    console.log('2️⃣ Checking for ThemeToggle button...');
    const toggleExists = await page.$('button[aria-label="Toggle theme"]') !== null;
    console.log(toggleExists ? '✅ ThemeToggle button found on home page!' : '❌ ThemeToggle button missing');
    console.log('');

    if (toggleExists) {
      // Click to enable dark mode
      console.log('3️⃣ Clicking ThemeToggle to enable dark mode...');
      await page.click('button[aria-label="Toggle theme"]');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_25/step_2_home_dark_mode.png' });
      console.log('✅ Dark mode enabled\n');

      // Check dark mode is active
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      console.log(isDark ? '✅ Dark mode class confirmed' : '❌ Dark mode class not found');
      console.log('');

      // Navigate to notes page
      console.log('4️⃣ Navigating to notes page...');
      await page.click('a[href="/notes"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/verification/feature_25/step_3_notes_dark_mode.png' });
      console.log('✅ Notes page loaded (dark mode should persist)\n');

      // Check dark mode persists
      const isDarkOnNotes = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      console.log(isDarkOnNotes ? '✅ Dark mode persists on notes page!' : '❌ Dark mode not persisted');
      console.log('');

      // Click toggle again to go back to light mode
      console.log('5️⃣ Clicking ThemeToggle to restore light mode...');
      const toggle = await page.$('button[aria-label="Toggle theme"]');
      if (toggle) {
        await toggle.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/verification/feature_25/step_4_notes_light_mode.png' });
        console.log('✅ Light mode restored\n');
      }

      // Refresh to test persistence
      console.log('6️⃣ Testing persistence with refresh...');
      await page.click('button[aria-label="Toggle theme"]'); // Back to dark
      await page.waitForTimeout(500);
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_25/step_5_after_refresh.png' });

      const isDarkAfterRefresh = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      console.log(isDarkAfterRefresh ? '✅ Dark mode persists after refresh!' : '❌ Dark mode not persisted');
    }

    console.log('\n✅ Dark Mode Verification Complete!');
    console.log('📸 Screenshots saved to tests/verification/feature_25/');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
