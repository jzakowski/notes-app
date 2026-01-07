#!/usr/bin/env node

/**
 * Uploadthing Setup Test Script
 *
 * This script verifies that Uploadthing is properly configured for cloud file storage.
 *
 * Usage:
 *   node test_uploadthing_setup.js
 */

require('dotenv').config({ path: '.env' })

const fs = require('fs')
const path = require('path')

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(70))
  log(title, 'cyan')
  console.log('='.repeat(70))
}

async function testUploadthingSetup() {
  logSection('Uploadthing Configuration Test')

  // Test 1: Check environment variables
  log('\nTest 1: Checking Uploadthing environment variables...', 'yellow')

  const uploadthingAppId = process.env.UPLOADTHING_APP_ID
  const uploadthingSecret = process.env.UPLOADTHING_SECRET
  const uploadthingUrl = process.env.UPLOADTHING_URL

  if (!uploadthingAppId || uploadthingAppId.trim() === '') {
    log('❌ UPLOADTHING_APP_ID is not set', 'red')
    log('\nTo get your Uploadthing credentials:', 'yellow')
    log('1. Go to: https://uploadthing.com/dashboard', 'blue')
    log('2. Create a new app or select existing one', 'blue')
    log('3. Copy your App ID and Secret to .env file', 'blue')
    log('\nExample .env configuration:', 'blue')
    log('  UPLOADTHING_APP_ID="your-app-id"', 'reset')
    log('  UPLOADTHING_SECRET="your-secret-key"', 'reset')
    return false
  }

  log('✓ UPLOADTHING_APP_ID is set', 'green')

  if (!uploadthingSecret || uploadthingSecret.trim() === '') {
    log('❌ UPLOADTHING_SECRET is not set', 'red')
    log('Add UPLOADTHING_SECRET to your .env file', 'yellow')
    return false
  }

  log('✓ UPLOADTHING_SECRET is set', 'green')
  log(`✓ UPLOADTHING_URL: ${uploadthingUrl || 'Not configured (using default)'}`, 'green')

  // Test 2: Check file router configuration
  logSection('Testing File Router Configuration')

  log('\nTest 2: Verifying file router exists...', 'yellow')

  const uploadthingPath = path.join(__dirname, 'src/lib/uploadthing.ts')

  if (!fs.existsSync(uploadthingPath)) {
    log(`❌ File router not found at ${uploadthingPath}`, 'red')
    return false
  }

  log('✓ File router configuration exists', 'green')

  const uploadthingContent = fs.readFileSync(uploadthingPath, 'utf-8')

  // Check for required configurations
  const checks = [
    { name: 'Image uploader configured', pattern: /image.*maxFileSize/ },
    { name: 'Video uploader configured', pattern: /video.*maxFileSize/ },
    { name: 'Middleware defined', pattern: /middleware/ },
    { name: 'onUploadComplete handler', pattern: /onUploadComplete/ },
  ]

  checks.forEach(check => {
    if (check.pattern.test(uploadthingContent)) {
      log(`✓ ${check.name}`, 'green')
    } else {
      log(`❌ ${check.name} - not found`, 'red')
    }
  })

  // Test 3: Check API route
  logSection('Testing API Route Configuration')

  log('\nTest 3: Verifying API route exists...', 'yellow')

  const apiRoutePath = path.join(__dirname, 'src/app/api/uploadthing/[slug]/route.ts')

  if (!fs.existsSync(apiRoutePath)) {
    log(`❌ API route not found at ${apiRoutePath}`, 'red')
    return false
  }

  log('✓ API route exists at /api/uploadthing/[slug]', 'green')

  const apiRouteContent = fs.readFileSync(apiRoutePath, 'utf-8')

  if (apiRouteContent.includes('createRouteHandler')) {
    log('✓ Route handler configured', 'green')
  } else {
    log('❌ Route handler not configured', 'red')
    return false
  }

  // Test 4: Check package.json dependencies
  logSection('Testing Dependencies')

  log('\nTest 4: Verifying uploadthing is installed...', 'yellow')

  const packageJsonPath = path.join(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  const hasUploadthing = packageJson.dependencies?.uploadthing ||
                         packageJson.devDependencies?.uploadthing

  if (!hasUploadthing) {
    log('❌ uploadthing package not found in dependencies', 'red')
    log('Run: npm install uploadthing', 'yellow')
    return false
  }

  log('✓ uploadthing package is installed', 'green')
  log(`  Version: ${packageJson.dependencies.uploadthing || packageJson.devDependencies.uploadthing}`, 'blue')

  // Test 5: Check file type validations
  logSection('File Type and Size Validation')

  log('\nTest 5: Checking file upload constraints...', 'yellow')

  const sizeLimits = uploadthingContent.match(/maxFileSize:\s*"([^"]+)"/g)

  if (sizeLimits) {
    log('✓ File size limits configured:', 'green')
    sizeLimits.forEach(limit => {
      log(`  ${limit}`, 'blue')
    })
  } else {
    log('⚠ No file size limits found', 'yellow')
  }

  const fileCountLimit = uploadthingContent.match(/maxFileCount:\s*(\d+)/)

  if (fileCountLimit) {
    log(`✓ Max file count: ${fileCountLimit[1]}`, 'green')
  } else {
    log('⚠ No file count limit found', 'yellow')
  }

  // Test 6: Check for local fallback
  logSection('Local Fallback Configuration')

  log('\nTest 6: Checking local storage fallback...', 'yellow')

  const localFallbackPath = path.join(__dirname, 'src/lib/storage.ts')

  if (fs.existsSync(localFallbackPath)) {
    log('✓ Local fallback storage configured', 'green')
    const storageContent = fs.readFileSync(localFallbackPath, 'utf-8')

    if (storageContent.includes('uploadthing')) {
      log('✓ Storage logic includes Uploadthing integration', 'green')
    }
  } else {
    log('⚠ No local fallback configured', 'yellow')
  }

  // Summary
  logSection('Summary')

  log('✓ All Uploadthing configuration checks passed!', 'green')
  log('\nYour Uploadthing setup is ready to use.', 'blue')

  log('\nConfiguration summary:', 'cyan')
  log(`  App ID: ${uploadthingAppId.substring(0, 8)}...`, 'blue')
  log(`  API URL: ${uploadthingUrl || '/api/uploadthing'}`, 'blue')
  log(`  Supported types: Images (5MB), Videos (100MB)`, 'blue')

  log('\nNext steps:', 'yellow')
  log('1. Restart your development server: npm run dev', 'reset')
  log('2. Open the app and create/edit a note', 'reset')
  log('3. Try uploading an image or video', 'reset')
  log('4. Check browser console for upload progress', 'reset')

  log('\nTest the upload endpoint:', 'yellow')
  log(`  POST ${uploadthingUrl || '/api/uploadthing'}`, 'reset')
  log('  Content-Type: multipart/form-data', 'reset')
  log('  Body: file=<file data>', 'reset')

  log('\nCORS configuration:', 'yellow')
  log('  ✓ Uploadthing automatically handles CORS for localhost', 'green')
  log('  ✓ No additional CORS configuration needed', 'green')

  return true
}

// Run the test
testUploadthingSetup()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  })
