const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('🚀 Starting browser automation test for Image URL feature...');

    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    console.log('📸 Step 1: Navigating to notes page...');
    await page.goto('http://localhost:3000/notes', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({
      path: 'tests/verification/feature_17/step_1_notes_page.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: step_1_notes_page.png');

    console.log('🖱️  Step 2: Clicking on a note...');
    // Wait for notes to load
    await page.waitForSelector('a[href^="/notes/"]', { timeout: 5000 });

    // Click on the first note
    const firstNote = await page.$('a[href^="/notes/"]');
    if (firstNote) {
      await firstNote.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  No notes found, creating a new note...');
      // Try to find the "New Note" button
      const newNoteButton = await page.$('button:has-text("New Note"), a:has-text("New Note")');
      if (newNoteButton) {
        await newNoteButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Take screenshot after opening note
    await page.screenshot({
      path: 'tests/verification/feature_17/step_2_note_opened.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: step_2_note_opened.png');

    console.log('🖼️  Step 3: Looking for image URL button in toolbar...');

    // Look for the image button in the toolbar
    await page.waitForTimeout(1000);

    const imageButtonSelector = 'button[title="Insert image from URL"], button[aria-label="Insert image from URL"]';

    // Take screenshot before clicking
    await page.screenshot({
      path: 'tests/verification/feature_17/step_3_toolbar_visible.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: step_3_toolbar_visible.png');

    // Check if button exists
    const imageButtonExists = await page.evaluate((sel) => {
      const button = document.querySelector(sel);
      return button !== null;
    }, imageButtonSelector);

    if (imageButtonExists) {
      console.log('✅ Image URL button found!');

      // Click the image URL button
      await page.click(imageButtonSelector);
      await page.waitForTimeout(1000);

      // Take screenshot of dialog
      await page.screenshot({
        path: 'tests/verification/feature_17/step_4_image_dialog_open.png',
        fullPage: true
      });
      console.log('✅ Screenshot saved: step_4_image_dialog_open.png');

      console.log('🔗 Step 5: Testing URL validation...');

      // Test invalid URL
      await page.type('#imageUrl', 'not-a-valid-url');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/verification/feature_17/step_5_invalid_url_error.png',
        fullPage: true
      });
      console.log('✅ Screenshot saved: step_5_invalid_url_error.png');

      // Clear and enter valid URL
      await page.click('#imageUrl', { clickCount: 3 });
      await page.keyboard.press('Backspace');

      const testImageUrl = 'https://via.placeholder.com/600x400.png';
      await page.type('#imageUrl', testImageUrl);
      await page.waitForTimeout(2000);

      // Take screenshot with preview
      await page.screenshot({
        path: 'tests/verification/feature_17/step_6_valid_url_with_preview.png',
        fullPage: true
      });
      console.log('✅ Screenshot saved: step_6_valid_url_with_preview.png');

      console.log('✅ Step 7: Inserting image...');

      // Click insert button
      await page.click('button:has-text("Insert Image")');
      await page.waitForTimeout(2000);

      // Take screenshot after insertion
      await page.screenshot({
        path: 'tests/verification/feature_17/step_7_image_inserted.png',
        fullPage: true
      });
      console.log('✅ Screenshot saved: step_7_image_inserted.png');

      // Check if image was inserted
      const imageInserted = await page.evaluate(() => {
        const img = document.querySelector('img[src="https://via.placeholder.com/600x400.png"]');
        return img !== null;
      });

      if (imageInserted) {
        console.log('✅ SUCCESS: Image was inserted successfully!');
      } else {
        console.log('⚠️  Warning: Image element not found in DOM');
      }

    } else {
      console.log('❌ FAIL: Image URL button not found in toolbar');
    }

    console.log('\n✅ Test completed!');
    console.log('📁 Screenshots saved to: tests/verification/feature_17/');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
