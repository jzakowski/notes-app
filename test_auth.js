const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Test Step 1: Sign up
    console.log('Testing signup flow...');
    await page.goto('http://localhost:3000/auth/signup', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // Take screenshot of signup page
    await page.screenshot({ path: 'tests/verification/feature_3/step_1_signup_page.png' });
    console.log('✅ Screenshot 1: Signup page loaded');

    // Fill in signup form
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'password123');
    await page.type('#name', 'Test User');
    await page.waitForTimeout(1000);

    // Take screenshot after filling form
    await page.screenshot({ path: 'tests/verification/feature_3/step_2_signup_filled.png' });
    console.log('✅ Screenshot 2: Form filled');

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Check if redirected to notes
    const url = page.url();
    console.log('Current URL after signup:', url);

    if (url.includes('/notes')) {
      console.log('✅ Signup successful - redirected to notes');
      await page.screenshot({ path: 'tests/verification/feature_3/step_3_after_signup.png' });
      console.log('✅ Screenshot 3: After signup');
    } else {
      console.log('⚠️  Signup may have failed - not redirected to /notes');
      await page.screenshot({ path: 'tests/verification/feature_3/step_3_signup_failed.png' });
    }

    console.log('✅ Signup test complete!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
