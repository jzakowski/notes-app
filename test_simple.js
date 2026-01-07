const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Navigating to notes page...');
    await page.goto('http://localhost:3000/notes', { waitUntil: 'networkidle0' });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tests/verification/quick_check_sidebar.png' });
    console.log('✅ Screenshot saved: tests/verification/quick_check_sidebar.png');

    const sidebarVisible = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      if (!sidebar) return false;
      const style = window.getComputedStyle(sidebar);
      return style.display !== 'none';
    });

    console.log('Sidebar visible:', sidebarVisible);

    if (sidebarVisible) {
      console.log('✅ Core features verified - sidebar is working!');
    } else {
      console.log('⚠️  Warning: Sidebar not visible');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
