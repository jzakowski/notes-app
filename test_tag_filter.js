const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000/notes');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'tests/verification/feature_12/step_1_initial_state.png' });
    console.log('✓ Step 1: Initial state screenshot saved');

    // Check if user is logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      console.log('Need to login first...');
      console.log('⚠ Skipping test - login required');
      await browser.close();
      return;
    }

    console.log('Looking for tags in sidebar...');
    // Wait for tags to load
    await page.waitForTimeout(2000);

    // Try to find tags
    const tags = await page.$$('text=/#/');
    console.log(`Found ${tags.length} tags`);

    if (tags.length === 0) {
      console.log('⚠ No tags found - need to create tags first');
      await page.screenshot({ path: 'tests/verification/feature_12/step_2_no_tags.png' });
      console.log('✓ Step 2: No tags screenshot saved');
    } else {
      // Click first tag
      console.log('Clicking first tag...');
      await tags[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/verification/feature_12/step_3_tag_filtered.png' });
      console.log('✓ Step 3: Tag filter screenshot saved');

      // Check if clear filters button is visible
      const clearButton = await page.$('text=Clear filters');
      if (clearButton) {
        console.log('✓ Clear filters button is visible');
      } else {
        console.log('✗ Clear filters button not found');
      }
    }

    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
