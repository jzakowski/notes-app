#!/usr/bin/env node

/**
 * Test script to verify S3 upload API endpoint
 * Tests both S3 (when configured) and local fallback
 */

const http = require('http')

// ANSI colors
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

async function testUploadAPI() {
  logSection('Upload API Test')

  const testFile = Buffer.from('Test file content for upload')

  // Create a test file as FormData
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
  let body = ''

  body += `--${boundary}\r\n`
  body += 'Content-Disposition: form-data; name="file"; filename="test-upload.jpg"\r\n'
  body += 'Content-Type: image/jpeg\r\n\r\n'
  body += testFile.toString('base64')
  body += `\r\n--${boundary}--\r\n`

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    },
  }

  log('Sending test upload request...', 'yellow')

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)

          if (res.statusCode === 200) {
            log('✓ Upload API responded successfully', 'green')
            logSection('Response Details')

            Object.entries(response).forEach(([key, value]) => {
              log(`  ${key}: ${value}`, 'blue')
            })

            if (response.storageType === 's3') {
              log('\n✓ Using S3 storage', 'green')
              log('  Presigned URL generated for direct upload', 'blue')
            } else if (response.storageType === 'local') {
              log('\n✓ Using local storage (S3 not configured)', 'yellow')
              if (response.warning) {
                log(`  ⚠ ${response.warning}`, 'yellow')
              }
              log(`  File URL: ${response.url}`, 'blue')
            }

            resolve(response)
          } else {
            log(`❌ Upload failed with status ${res.statusCode}`, 'red')
            log(data, 'red')
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        } catch (error) {
          log('❌ Failed to parse response', 'red')
          log(data, 'red')
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      log('❌ Request failed', 'red')
      log(error.message, 'red')
      reject(error)
    })

    req.write(body)
    req.end()
  })
}

async function main() {
  try {
    await testUploadAPI()

    logSection('Summary')
    log('✓ Upload API is working correctly', 'green')
    log('\nExpected behavior:', 'blue')
    log('- If S3 is configured: Returns presigned URL for S3 upload', 'reset')
    log('- If S3 is NOT configured: Falls back to local storage', 'reset')

    process.exit(0)
  } catch (error) {
    logSection('Summary')
    log('❌ Test failed', 'red')
    log(error.message, 'red')
    process.exit(1)
  }
}

main()
