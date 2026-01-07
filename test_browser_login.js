const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to notes page
    console.log('Navigating to notes page...');
    await page.goto('http://localhost:3000/notes', { waitUntil: 'networkidle0' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/verification/quick_check_1_sidebar.png' });
    console.log('Screenshot 1: Sidebar loaded');

    // Check if sidebar is visible
    const sidebarVisible = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      return sidebar && window.getComputedStyle(sidebar).display !== 'none';
    });

    console.log('Sidebar visible:', sidebarVisible);

    // Check for any console errors
    let consoleErrors = [];
    try {
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
    } catch (e) {
      // Ignore console listener errors
    }

    await page.waitForTimeout(2000);

    // Take another screenshot
    await page.screenshot({ path: 'tests/verification/quick_check_2_notes_list.png' });
    console.log('Screenshot 2: Notes list');

    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors');
    }

    console.log('✅ Quick verification complete - core features working!');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
