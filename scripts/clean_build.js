#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning Next.js build...');

const nextDir = path.join(process.cwd(), '.next');

if (fs.existsSync(nextDir)) {
  console.log('Removing .next directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ .next directory removed');
} else {
  console.log('ℹ️ .next directory does not exist');
}

console.log('\n🔨 Starting Next.js development server...');
console.log('This will take a moment to rebuild...\n');

try {
  // Start dev server in background
  const { spawn } = require('child_process');
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  console.log('✅ Development server started!');
  console.log('📝 Logs are being written to logs/dev.log');
  console.log('🌐 App will be available at http://localhost:3000');
  console.log('\nPress Ctrl+C to stop the server\n');

  devServer.on('error', (error) => {
    console.error('❌ Error starting dev server:', error);
    process.exit(1);
  });

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping development server...');
    devServer.kill();
    process.exit(0);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
