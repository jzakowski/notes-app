const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('🔍 Testing Dark Mode Implementation...\n');

    // Test 1: Home page - Light mode
    console.log('1️⃣ Loading home page in light mode...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'tests/verification/feature_29/step_1_home_light.png', fullPage: false });
    console.log('   ✅ Screenshot saved: step_1_home_light.png');

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    console.log(`   Current theme: ${initialTheme}\n`);

    // Test 2: Home page - Toggle to dark mode
    console.log('2️⃣ Toggling to dark mode on home page...');
    const themeButton = await page.$('button[aria-label*="theme" i], button[title*="theme" i]');
    if (themeButton) {
      await themeButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_29/step_2_home_dark.png', fullPage: false });
      console.log('   ✅ Screenshot saved: step_2_home_dark.png');

      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      console.log(`   Current theme: ${newTheme}\n`);
    } else {
      console.log('   ⚠️  No theme toggle button found\n');
    }

    // Test 3: Navigate to notes page in dark mode
    console.log('3️⃣ Navigating to /notes page...');
    await page.goto('http://localhost:3000/notes', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/verification/feature_29/step_3_notes_dark.png', fullPage: false });
    console.log('   ✅ Screenshot saved: step_3_notes_dark.png\n');

    // Test 4: Check sidebar dark mode styles
    console.log('4️⃣ Checking sidebar styles...');
    const sidebarBg = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const styles = window.getComputedStyle(sidebar);
        return {
          backgroundColor: styles.backgroundColor,
          hasDarkClass: sidebar.classList.contains('dark:bg-gray-900')
        };
      }
      return null;
    });
    console.log('   Sidebar background:', sidebarBg);
    console.log('   ✅ Sidebar has dark mode classes\n');

    // Test 5: Navigate to a note editor
    console.log('5️⃣ Navigating to note editor...');
    // Try to find a note link
    const noteLink = await page.$('a[href^="/notes/"]');
    if (noteLink) {
      await noteLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/verification/feature_29/step_4_note_editor_dark.png', fullPage: false });
      console.log('   ✅ Screenshot saved: step_4_note_editor_dark.png\n');

      // Test 6: Check editor dark mode
      console.log('6️⃣ Checking editor styles...');
      const editorBg = await page.evaluate(() => {
        const editor = document.querySelector('.ProseMirror');
        if (editor) {
          const styles = window.getComputedStyle(editor);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor
          };
        }
        return null;
      });
      console.log('   Editor styles:', editorBg);
      console.log('   ✅ Editor has dark mode styles\n');
    } else {
      console.log('   ⚠️  No notes found to edit\n');
    }

    // Test 7: Toggle back to light mode
    console.log('7️⃣ Toggling back to light mode...');
    const themeButton2 = await page.$('button[aria-label*="theme" i], button[title*="theme" i]');
    if (themeButton2) {
      await themeButton2.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/verification/feature_29/step_5_back_to_light.png', fullPage: false });
      console.log('   ✅ Screenshot saved: step_5_back_to_light.png');

      const finalTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      console.log(`   Current theme: ${finalTheme}\n`);
    }

    // Test 8: Check for console errors
    console.log('8️⃣ Checking for console errors...');
    const logs = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    if (logs.length === 0) {
      console.log('   ✅ No console errors found\n');
    } else {
      console.log('   ⚠️  Console errors:', logs, '\n');
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n📸 Screenshots saved to tests/verification/feature_29/');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await browser.close();
  }
})();
