#!/usr/bin/env node

/**
 * S3 Configuration Test Script
 *
 * This script verifies that S3 credentials and bucket are properly configured.
 *
 * Usage:
 *   node test_s3_config.js
 */

require('dotenv').config({ path: '.env' })

const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3')

// ANSI color codes for output
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
  console.log('\n' + '='.repeat(60))
  log(title, 'blue')
  console.log('='.repeat(60))
}

async function testS3Configuration() {
  logSection('S3 Configuration Test')

  // Check environment variables
  log('Checking environment variables...', 'yellow')

  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET', 'AWS_REGION']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red')
    log('\nPlease add these to your .env file:', 'yellow')
    missingVars.forEach(varName => {
      log(`  ${varName}=your-value-here`, 'reset')
    })
    log('\nSee docs/S3_SETUP.md for detailed setup instructions.', 'yellow')
    return false
  }

  log('✓ All required environment variables are set', 'green')

  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    cloudFront: process.env.AWS_CLOUDFRONT_DOMAIN || 'Not configured',
  }

  logSection('Configuration Details')
  Object.entries(config).forEach(([key, value]) => {
    if (key === 'secretAccessKey') {
      log(`  ${key}: ${value ? '***' + value.slice(-4) : 'not set'}`, 'blue')
    } else {
      log(`  ${key}: ${value}`, 'blue')
    }
  })

  // Initialize S3 client
  logSection('Testing S3 Connection')

  const s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  try {
    // Test 1: List buckets (requires any S3 permission)
    log('\nTest 1: Listing accessible buckets...', 'yellow')
    const listCommand = new ListBucketsCommand({})
    const listResponse = await s3Client.send(listCommand)

    const bucketExists = listResponse.Buckets?.some(b => b.Name === config.bucket)
    if (bucketExists) {
      log(`✓ Found bucket: ${config.bucket}`, 'green')
    } else {
      log(`⚠ Bucket "${config.bucket}" not found in accessible buckets`, 'yellow')
      log('  Available buckets:', 'blue')
      listResponse.Buckets?.forEach(b => log(`    - ${b.Name}`, 'reset'))
    }
  } catch (error) {
    log(`❌ Failed to list buckets: ${error.message}`, 'red')
    log('  This usually indicates an IAM permission issue', 'yellow')
    return false
  }

  try {
    // Test 2: Head bucket (requires s3:ListBucket permission on the bucket)
    log('\nTest 2: Checking bucket access...', 'yellow')
    const headCommand = new HeadBucketCommand({ Bucket: config.bucket })
    await s3Client.send(headCommand)
    log(`✓ Can access bucket: ${config.bucket}`, 'green')
  } catch (error) {
    log(`❌ Cannot access bucket: ${error.message}`, 'red')
    log('  Common causes:', 'yellow')
    log('    - Bucket does not exist', 'reset')
    log('    - IAM user lacks s3:ListBucket permission', 'reset')
    log('    - Bucket is in a different region', 'reset')
    return false
  }

  // Test presigned URL generation
  logSection('Testing Presigned URL Generation')

  try {
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
    const { PutObjectCommand } = require('@aws-sdk/client-s3')

    log('\nGenerating test presigned URL...', 'yellow')

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: 'uploads/test-file.jpg',
      ContentType: 'image/jpeg',
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

    if (presignedUrl && presignedUrl.startsWith('https://')) {
      log('✓ Presigned URL generated successfully', 'green')
      log(`  URL length: ${presignedUrl.length} characters`, 'blue')
      log(`  Expires in: 5 minutes`, 'blue')
    } else {
      log('❌ Presigned URL generation failed', 'red')
      return false
    }
  } catch (error) {
    log(`❌ Failed to generate presigned URL: ${error.message}`, 'red')
    return false
  }

  // Summary
  logSection('Summary')
  log('✓ All S3 configuration tests passed!', 'green')
  log('\nYour S3 storage is ready to use.', 'blue')
  log('The app will automatically use S3 when you upload files.', 'blue')

  if (config.cloudFront !== 'Not configured') {
    log(`\nCloudFront CDN: ${config.cloudFront}`, 'blue')
  } else {
    log('\nCloudFront: Not configured (optional)', 'yellow')
    log('Files will be served from: ' +
        `https://${config.bucket}.s3.${config.region}.amazonaws.com/`, 'blue')
  }

  log('\nNext steps:', 'yellow')
  log('1. Restart your development server: npm run dev', 'reset')
  log('2. Upload a file in the app', 'reset')
  log('3. Check console for "Upload - Using S3 storage" message', 'reset')

  return true
}

// Run the test
testS3Configuration()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  })
