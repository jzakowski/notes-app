# AWS S3 Setup Guide

This guide explains how to configure AWS S3 as a fallback file storage option for the notes app.

## Prerequisites

- AWS account with appropriate permissions
- Basic knowledge of AWS services

## Step 1: Create an S3 Bucket

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure the bucket:
   - **Bucket name**: Choose a unique name (e.g., `notes-app-uploads-12345`)
   - **Region**: Choose a region close to your users (e.g., `us-east-1`)
   - **Block Public Access settings**:
     - Uncheck **Block all public access** (we'll configure CORS and bucket policy instead)
     - Or keep it checked if using presigned URLs only (recommended)
5. Click **Create bucket**

## Step 2: Configure CORS

1. Open your bucket in the S3 console
2. Go to the **Permissions** tab
3. Scroll down to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and add the following:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

## Step 3: Create IAM User for Programmatic Access

1. Navigate to **IAM** service in AWS Console
2. Go to **Users** → **Add users**
3. Configure user:
   - **User name**: `notes-app-s3`
   - **Select AWS credential type**: Check **Access key - Programmatic access**
4. Click **Next**
5. Set permissions:
   - Select **Attach policies directly**
   - Click **Create policy**
   - Use the JSON editor:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3UploadAndDelete",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/uploads/*"
    },
    {
      "Sid": "S3ListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

6. Name the policy (e.g., `NotesAppS3Access`)
7. Create the policy and attach it to the user
8. Click **Create user**

## Step 4: Get Access Keys

1. After creating the user, you'll see the **Access key ID** and **Secret access key**
2. **Important**: Copy these values now - you won't be able to see the secret key again!
3. Download the CSV file for safekeeping

## Step 5: Configure Environment Variables

Add the following to your `.env` file:

```bash
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"  # Use your bucket's region
AWS_S3_BUCKET="your-bucket-name"
```

## Step 6: (Optional) Set Up CloudFront CDN

To improve performance and reduce AWS S3 costs:

1. Navigate to **CloudFront** in AWS Console
2. Click **Create distribution**
3. Configure:
   - **Origin domain**: Select your S3 bucket from the dropdown
   - **Origin access**: Choose **Origin access control settings (recommended)**
   - **Default cache behavior**:
     - Allow GET, HEAD methods
     - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - **Settings**:
     - **Alternate domain names**: `uploads.yourdomain.com` (optional)
     - **Custom SSL certificate**: Add your certificate if using custom domain

4. Create distribution
5. Update your `.env`:

```bash
AWS_CLOUDFRONT_DOMAIN="d1234567890.cloudfront.net"  # Your distribution domain
```

## Step 7: Test the Configuration

1. Restart your development server:

```bash
npm run dev
```

2. The app will automatically use S3 if credentials are configured
3. Try uploading a file and check the console logs:
   - Should see: `Upload - Using S3 storage`
   - File should be uploaded to `https://s3.amazonaws.com/your-bucket/uploads/...`

## Testing Without S3

The app gracefully falls back to local storage if S3 is not configured:
- Files are stored in `public/uploads/`
- Warning is shown in the UI
- Perfect for development

## S3 Bucket Policy (Optional - for Public Access)

If you want files to be publicly accessible (not recommended for sensitive data):

1. Go to your S3 bucket → **Permissions** → **Bucket policy**
2. Add this policy (replace `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/uploads/*"
    }
  ]
}
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use presigned URLs** for uploads (automatically handled)
3. **Limit IAM permissions** to only required actions
4. **Enable S3 bucket encryption** (Server-side encryption)
5. **Use HTTPS** for all file URLs
6. **Consider bucket policies** to prevent unauthorized access

## Cost Considerations

- **S3 Storage**: ~$0.023/GB/month
- **S3 Requests**: ~$0.0004 per 1,000 requests
- **Data Transfer**: First 100GB/month free, then ~$0.09/GB
- **CloudFront**: Can reduce costs through caching

Estimated cost for 1,000 users with 10MB each:
- Storage: $0.23/month
- Requests: Negligible
- Data transfer: ~$9/month (without CloudFront)

## Troubleshooting

### "S3 unavailable, falling back to local storage"
- Check that environment variables are set correctly
- Verify IAM user has proper permissions
- Check bucket name and region match

### "Access Denied" errors
- Verify IAM policy allows `s3:PutObject` and `s3:DeleteObject`
- Check bucket CORS configuration
- Ensure bucket name is correct

### Files not accessible
- If using CloudFront, wait for distribution to deploy (~15 minutes)
- Check bucket policy if files should be public
- Verify the URL format is correct

## Monitoring

Enable S3 **Server Access Logging** to track:
- Upload/delete operations
- Access patterns
- Potential security issues

Go to **S3** → **Bucket** → **Properties** → **Server access logging** → **Edit**

## Cleanup

To delete S3 resources:
1. Empty the S3 bucket
2. Delete the bucket
3. Delete or disable the IAM user
4. Delete the CloudFront distribution (if created)

---

For questions or issues, please refer to the [AWS S3 Documentation](https://docs.aws.amazon.com/s3/).
