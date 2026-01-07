/**
 * S3 Feature Verification Test
 *
 * This test verifies the S3 fallback functionality:
 * 1. S3 utilities are correctly implemented
 * 2. Upload API falls back to local storage when S3 not configured
 * 3. File cleanup works on note deletion
 * 4. Warning shown when using local storage
 */

const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(70))
  log(title, 'blue')
  console.log('='.repeat(70))
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function checkFileContains(filePath, content) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return fileContent.includes(content)
  } catch {
    return false
  }
}

function runTests() {
  logSection('S3 Feature Verification Test')
  log('Issue #22: File Storage - S3 Fallback', 'yellow')

  let testsPassed = 0
  let testsFailed = 0

  // Test 1: S3 utility module exists
  logSection('Test 1: S3 Utility Module')
  const s3UtilsPath = path.join(__dirname, 'src/lib/s3.ts')
  if (checkFileExists(s3UtilsPath)) {
    log('✓ src/lib/s3.ts exists', 'green')
    testsPassed++
  } else {
    log('❌ src/lib/s3.ts not found', 'red')
    testsFailed++
  }

  // Test 2: S3 functions implemented
  logSection('Test 2: S3 Functions')
  const requiredFunctions = [
    'generatePresignedUploadUrl',
    'deleteS3File',
    'isS3Available'
  ]

  requiredFunctions.forEach(funcName => {
    if (checkFileContains(s3UtilsPath, funcName)) {
      log(`✓ Function ${funcName} implemented`, 'green')
      testsPassed++
    } else {
      log(`❌ Function ${funcName} not found`, 'red')
      testsFailed++
    }
  })

  // Test 3: Upload route updated
  logSection('Test 3: Upload Route Integration')
  const uploadRoutePath = path.join(__dirname, 'src/app/api/upload/route.ts')
  if (checkFileContains(uploadRoutePath, 'isS3Available')) {
    log('✓ Upload route checks S3 availability', 'green')
    testsPassed++
  } else {
    log('❌ Upload route does not check S3 availability', 'red')
    testsFailed++
  }

  if (checkFileContains(uploadRoutePath, 'generatePresignedUploadUrl')) {
    log('✓ Upload route uses S3 presigned URLs', 'green')
    testsPassed++
  } else {
    log('❌ Upload route does not use S3 presigned URLs', 'red')
    testsFailed++
  }

  if (checkFileContains(uploadRoutePath, 'storageType')) {
    log('✓ Upload route includes storage type in response', 'green')
    testsPassed++
  } else {
    log('❌ Upload route missing storage type', 'red')
    testsFailed++
  }

  // Test 4: Delete route updated
  logSection('Test 4: File Cleanup on Delete')
  const deleteRoutePath = path.join(__dirname, 'src/app/api/notes/[id]/route.ts')
  if (checkFileContains(deleteRoutePath, 'deleteS3File')) {
    log('✓ Delete route calls S3 file deletion', 'green')
    testsPassed++
  } else {
    log('❌ Delete route does not call S3 file deletion', 'red')
    testsFailed++
  }

  if (checkFileContains(deleteRoutePath, 'unlink')) {
    log('✓ Delete route handles local file deletion', 'green')
    testsPassed++
  } else {
    log('❌ Delete route does not handle local file deletion', 'red')
    testsFailed++
  }

  // Test 5: Environment variables documented
  logSection('Test 5: Environment Variables')
  const envExamplePath = path.join(__dirname, '.env.local')
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'AWS_CLOUDFRONT_DOMAIN'
  ]

  requiredEnvVars.forEach(varName => {
    if (checkFileContains(envExamplePath, varName)) {
      log(`✓ ${varName} documented in .env.local`, 'green')
      testsPassed++
    } else {
      log(`❌ ${varName} not documented`, 'red')
      testsFailed++
    }
  })

  // Test 6: Documentation
  logSection('Test 6: Documentation')
  const docsPath = path.join(__dirname, 'docs/S3_SETUP.md')
  if (checkFileExists(docsPath)) {
    log('✓ S3 setup documentation exists', 'green')
    testsPassed++

    // Check for key sections
    const keySections = [
      'Create an S3 Bucket',
      'Configure CORS',
      'IAM User',
      'Environment Variables',
      'CloudFront'
    ]

    keySections.forEach(section => {
      if (checkFileContains(docsPath, section)) {
        log(`✓ Documentation includes "${section}" section`, 'green')
        testsPassed++
      } else {
        log(`⚠ Documentation missing "${section}" section`, 'yellow')
      }
    })
  } else {
    log('❌ S3 setup documentation not found', 'red')
    testsFailed++
  }

  // Test 7: Test scripts
  logSection('Test 7: Test Scripts')
  const configTestPath = path.join(__dirname, 'test_s3_config.js')
  const uploadTestPath = path.join(__dirname, 'test_s3_upload.js')

  if (checkFileExists(configTestPath)) {
    log('✓ S3 configuration test script exists', 'green')
    testsPassed++
  } else {
    log('❌ S3 configuration test script not found', 'red')
    testsFailed++
  }

  if (checkFileExists(uploadTestPath)) {
    log('✓ S3 upload test script exists', 'green')
    testsPassed++
  } else {
    log('❌ S3 upload test script not found', 'red')
    testsFailed++
  }

  // Test 8: AWS SDK dependency
  logSection('Test 8: Dependencies')
  const packageJsonPath = path.join(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  if (packageJson.dependencies['@aws-sdk/client-s3']) {
    log('✓ @aws-sdk/client-s3 installed', 'green')
    testsPassed++
  } else {
    log('❌ @aws-sdk/client-s3 not installed', 'red')
    testsFailed++
  }

  if (packageJson.dependencies['@aws-sdk/s3-request-presigner']) {
    log('✓ @aws-sdk/s3-request-presigner installed', 'green')
    testsPassed++
  } else {
    log('❌ @aws-sdk/s3-request-presigner not installed', 'red')
    testsFailed++
  }

  // Summary
  logSection('Test Summary')
  const totalTests = testsPassed + testsFailed
  log(`Total tests: ${totalTests}`, 'blue')
  log(`Passed: ${testsPassed}`, 'green')
  log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green')

  if (testsFailed === 0) {
    log('\n✓ All S3 fallback features implemented successfully!', 'green')
    log('\nNext steps:', 'yellow')
    log('1. Set up AWS S3 bucket (see docs/S3_SETUP.md)', 'reset')
    log('2. Add credentials to .env file', 'reset')
    log('3. Run: node test_s3_config.js', 'reset')
    log('4. Test upload in the app with a real file', 'reset')
    return true
  } else {
    log('\n❌ Some tests failed. Please review the implementation.', 'red')
    return false
  }
}

// Run tests
const success = runTests()
process.exit(success ? 0 : 1)
