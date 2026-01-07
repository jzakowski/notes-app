import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Check if S3 is configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION
  )
}

// Initialize S3 client (only if configured)
const s3Client = isS3Configured()
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

const BUCKET_NAME = process.env.AWS_S3_BUCKET || ''
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || ''

/**
 * Generate a presigned URL for direct upload to S3
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; fileUrl: string } | null> {
  if (!s3Client || !BUCKET_NAME) {
    return null
  }

  try {
    // Generate unique key for S3
    const key = `uploads/${Date.now()}-${filename}`

    // Create command for presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    // Generate presigned URL (valid for 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

    // Generate the URL that will be used to access the file
    const fileUrl = CLOUDFRONT_DOMAIN
      ? `https://${CLOUDFRONT_DOMAIN}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return { uploadUrl, fileUrl }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return null
  }
}

/**
 * Delete a file from S3
 */
export async function deleteS3File(fileUrl: string): Promise<boolean> {
  if (!s3Client || !BUCKET_NAME) {
    return false
  }

  try {
    // Extract key from URL
    let key: string

    if (CLOUDFRONT_DOMAIN && fileUrl.includes(CLOUDFRONT_DOMAIN)) {
      // Extract from CloudFront URL
      key = fileUrl.replace(`https://${CLOUDFRONT_DOMAIN}/`, '')
    } else {
      // Extract from S3 URL
      const url = new URL(fileUrl)
      key = url.pathname.slice(1) // Remove leading slash
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('Error deleting S3 file:', error)
    return false
  }
}

/**
 * Check if S3 is available
 */
export function isS3Available(): boolean {
  return isS3Configured()
}
