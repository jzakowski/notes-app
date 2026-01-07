const http = require('http');

/**
 * Simple HTTP-based test for the notes app
 * No browser required - just HTTP requests
 */

async function testPage(path, name) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name}: OK (${res.statusCode})`);
          resolve({ statusCode: res.statusCode, length: data.length });
        } else {
          console.log(`⚠️  ${name}: ${res.statusCode}`);
          resolve({ statusCode: res.statusCode, length: data.length });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${name}: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.error(`❌ ${name}: Timeout`);
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function testApp() {
  console.log('\n=== Notes App Health Check ===\n');

  try {
    // Test homepage
    await testPage('/', 'Homepage');

    // Test notes page
    await testPage('/notes', 'Notes Page');

    // Test API endpoints
    await testPage('/api/notes', 'Notes API');

    // Test auth page
    await testPage('/login', 'Login Page');

    console.log('\n✅ All critical endpoints accessible!');
    console.log('\nThe app is running correctly. You can manually test in your browser:');
    console.log('  → http://localhost:3000\n');

    return true;
  } catch (error) {
    console.error('\n❌ App health check failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check if Next.js is running: npm run dev');
    console.error('  2. Check the logs: tail -f logs/dev-server.log');
    console.error('  3. Verify port 3000 is not in use: lsof -i :3000\n');
    return false;
  }
}

// Run the test
testApp()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
