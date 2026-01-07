// Simple test to verify the image URL button is present
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/notes',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Page loaded successfully');

    // Check for image button markers
    const hasImageButton = data.includes('Insert image from URL') || data.includes('aria-label="Insert image from URL"');
    const hasImageDialog = data.includes('Insert Image from URL');

    if (hasImageButton) {
      console.log('✅ Image URL button found in toolbar');
    } else {
      console.log('⚠️  Image URL button not found');
    }

    if (hasImageDialog) {
      console.log('✅ Image URL dialog component present');
    } else {
      console.log('⚠️  Image URL dialog component not found');
    }

    if (hasImageButton && hasImageDialog) {
      console.log('\n✅ SUCCESS: Image URL feature components are present!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
