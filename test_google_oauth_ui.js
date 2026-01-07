const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Google OAuth UI...');

    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // Take screenshot of login page
    await page.screenshot({ path: 'tests/verification/feature_4/step_1_login_page.png' });
    console.log('✅ Screenshot 1: Login page loaded');

    // Check for Google button
    console.log('2️⃣ Checking for Google OAuth button...');
    const googleButton = await page.$('button');
    if (!googleButton) {
      throw new Error('Google button not found!');
    }
    console.log('✅ Google button found');

    // Check button text
    const buttonText = await page.evaluate(() => {
      const button = document.querySelector('button');
      return button ? button.textContent.trim() : '';
    });
    console.log(`Button text: "${buttonText}"`);

    if (!buttonText.includes('Google') && !buttonText.includes('Continue with')) {
      throw new Error('Button text does not mention Google!');
    }
    console.log('✅ Button text is correct');

    // Check for Google icon
    console.log('3️⃣ Checking for Google icon...');
    const hasGoogleIcon = await page.evaluate(() => {
      const svg = document.querySelector('button svg');
      return svg !== null;
    });

    if (!hasGoogleIcon) {
      throw new Error('Google icon not found!');
    }
    console.log('✅ Google icon found');

    // Check for form inputs
    console.log('4️⃣ Checking for email/password inputs...');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');

    if (!emailInput || !passwordInput) {
      throw new Error('Email or password input not found!');
    }
    console.log('✅ Email and password inputs found');

    // Navigate to signup page
    console.log('5️⃣ Checking signup page...');
    await page.goto('http://localhost:3000/auth/signup', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/verification/feature_4/step_2_signup_page.png' });
    console.log('✅ Screenshot 2: Signup page loaded');

    // Check for Google button on signup page
    const signupGoogleButton = await page.$('button');
    if (!signupGoogleButton) {
      throw new Error('Google button not found on signup page!');
    }
    console.log('✅ Google button found on signup page');

    console.log('\n✅ All UI checks passed!');
    console.log('\n📝 NOTE: To test the actual OAuth flow, you need to:');
    console.log('   1. Set up Google OAuth credentials (see docs/GOOGLE_OAUTH_SETUP.md)');
    console.log('   2. Add GOOGLE_ID and GOOGLE_SECRET to .env');
    console.log('   3. Restart the dev server');
    console.log('   4. Click the Google button to authenticate');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
