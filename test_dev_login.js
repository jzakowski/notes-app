/**
 * Test script for Dev Login feature
 *
 * This script tests:
 * 1. Dev login hint is visible on login page
 * 2. Quick dev login button works
 * 3. Dev user can log in with credentials
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testDevLogin() {
  console.log('🧪 Testing Dev Login Feature...\n');

  // Use the same Chrome path as test_browser_login.js
  const chromePath = path.join(
    process.env.HOME,
    '.cache/puppeteer/chrome/mac_arm-144.0.7559.31/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  );

  console.log('Launching Chrome from:', chromePath);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  try {
    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/verification/feature_40/step_1_login_page.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: step_1_login_page.png');

    // Step 2: Check if dev login hint is visible
    console.log('\nStep 2: Checking for dev login hint...');
    const devLoginVisible = await page.evaluate(() => {
      const devLoginBox = document.querySelector('.bg-blue-50');
      return devLoginBox !== null && devLoginBox.offsetParent !== null;
    });

    if (devLoginVisible) {
      console.log('✅ Dev login hint is visible');

      // Check credentials are displayed
      const devEmail = await page.evaluate(() => {
        const emailEl = document.querySelector('code');
        return emailEl ? emailEl.textContent : '';
      });
      console.log(`✅ Dev email displayed: ${devEmail}`);
    } else {
      console.log('❌ Dev login hint is NOT visible');
      throw new Error('Dev login hint should be visible in dev mode');
    }

    // Step 3: Click quick dev login button
    console.log('\nStep 3: Clicking quick dev login button...');
    const buttonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const devButton = buttons.find(btn => btn.textContent.includes('Quick Dev Login'));
      if (devButton) {
        devButton.click();
        return true;
      }
      return false;
    });

    if (buttonClicked) {
      console.log('✅ Clicked quick dev login button');
    } else {
      throw new Error('Could not find Quick Dev Login button');
    }

    // Step 4: Wait for navigation to notes page
    console.log('\nStep 4: Waiting for login to complete...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Take screenshot
    await page.screenshot({
      path: 'tests/verification/feature_40/step_2_logged_in.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: step_2_logged_in.png');

    // Step 5: Verify we're logged in
    console.log('\nStep 5: Verifying login success...');
    const isLoggedIn = await page.evaluate(() => {
      return window.location.pathname.startsWith('/notes');
    });

    if (isLoggedIn) {
      console.log('✅ Successfully logged in as dev user!');
    } else {
      console.log('❌ Login failed - not on notes page');
      throw new Error('Dev login failed');
    }

    // Step 6: Check for user info
    console.log('\nStep 6: Checking user session...');
    const pageText = await page.evaluate(() => document.body.textContent);
    const hasDevEmail = pageText.includes('dev@notes-app.local');
    console.log(`Dev email found on page: ${hasDevEmail ? 'Yes' : 'No'}`);

    if (hasDevEmail) {
      console.log('✅ Dev user session confirmed!');
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📸 Screenshots saved to: tests/verification/feature_40/');
    console.log('   - step_1_login_page.png');
    console.log('   - step_2_logged_in.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    // Take error screenshot
    await page.screenshot({
      path: 'tests/verification/feature_40/error.png',
      fullPage: true
    });
    console.log('📸 Error screenshot saved: error.png');

    throw error;
  } finally {
    await browser.close();
  }
}

// Create verification directory
const fs = require('fs');
const dir = './tests/verification/feature_40';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Run tests
testDevLogin().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
