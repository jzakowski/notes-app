# Uploadthing Setup Guide

This guide explains how to configure Uploadthing for cloud file storage in the Notes App.

## Overview

Uploadthing is now integrated into the application! The app supports three storage options:

1. **Local Storage** (default) - Files stored in `public/uploads/`
2. **AWS S3** - Configured via `docs/S3_SETUP.md`
3. **Uploadthing** - Described in this guide ✨

## What's Been Configured

✅ **Uploadthing packages installed**
- `uploadthing` - Core Uploadthing library
- `@uploadthing/react` - React components

✅ **API route created**
- `/api/uploadthing/[slug]/route.ts` - Uploadthing handler

✅ **File router configured**
- `src/lib/uploadthing.ts` - File upload configuration
- Supports images (max 5MB) and videos (max 100MB)

✅ **Environment variables ready**
- `.env` file updated with Uploadthing placeholders

## Step-by-Step Setup

### 1. Create Uploadthing Account

1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up for a free account
3. Create a new app

### 2. Get API Keys

1. In your Uploadthing dashboard, go to **API Keys**
2. Copy your **App ID** and **API Secret**
3. You'll see something like:
   - App ID: `abc123xyz456`
   - API Secret: `sk_live_xxxxxxxxxxxxxx`

### 3. Configure Environment Variables

Edit your `.env` file and add the Uploadthing credentials:

```bash
# Uploadthing (optional - for cloud file storage)
UPLOADTHING_APP_ID="your-app-id-here"
UPLOADTHING_SECRET="your-api-secret-here"
UPLOADTHING_URL="http://localhost:3000/api/uploadthing"
```

**Example:**
```bash
UPLOADTHING_APP_ID="abc123xyz456"
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxx"
UPLOADTHING_URL="http://localhost:3000/api/uploadthing"
```

### 4. Configure Allowed Origins (CORS)

1. In Uploadthing dashboard, go to **Settings**
2. Add your app URLs to **Allowed Origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

### 5. Restart the Development Server

After configuring the environment variables, restart your server:

```bash
npm run dev
```

## How Uploadthing Works in This App

### Architecture

The app now has a **dual upload system**:

```
┌─────────────────┐
│  User uploads   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Uploadthing Route              │
│  /api/uploadthing/[slug]/route  │
│  (NEW - for Uploadthing)        │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Uploadthing Cloud Storage      │
│  (Primary when configured)      │
└─────────────────────────────────┘
```

### File Route Configuration

The file router is configured in `src/lib/uploadthing.ts`:

```typescript
export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "5MB", maxFileCount: 1 },
    video: { maxFileSize: "100MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // Add authentication checks here
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      return { fileUrl: file.url };
    }),
};
```

## Using Uploadthing Components

### Option 1: Use UploadButton Component (Recommended)

Uploadthing provides a pre-built upload button. Here's how to use it:

```tsx
"use client";

import { UploadButton } from "@/lib/uploadthing";

export function NoteEditor() {
  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Handle successful upload
          const fileUrl = res[0].fileUrl;
          console.log("Upload complete:", fileUrl);
        }}
        onUploadError={(error) => {
          console.error("Upload error:", error);
        }}
      />
    </div>
  );
}
```

### Option 2: Use useUploadThing Hook (Custom UI)

For custom upload UI:

```tsx
"use client";

import { useUploadThing } from "@/lib/uploadthing";

export function CustomUploadButton() {
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload complete:", res[0].fileUrl);
    },
  });

  return (
    <button onClick={() => startUpload([file])}>
      Upload File
    </button>
  );
}
```

### Option 3: Keep Current Upload Flow

The current upload flow (`/api/upload` route) can be **enhanced** to use Uploadthing:

1. Current flow: Local storage → S3 fallback
2. Enhanced flow: Uploadthing → Local → S3

To integrate Uploadthing into the existing flow, you would modify `src/app/api/upload/route.ts` to check for Uploadthing availability first.

## Testing Uploadthing

### 1. Test Configuration

Check if Uploadthing is configured:

```bash
curl http://localhost:3000/api/uploadthing
```

Should return: `Uploadthing route is ready`

### 2. Test File Upload

Use the test script provided:

```bash
node tests/verification/feature_21/test_uploadthing.js
```

Or manually test via the UI:
1. Open any note in the editor
2. Click the upload button
3. Select a file
4. Verify it uploads to Uploadthing cloud

### 3. Verify in Uploadthing Dashboard

1. Go to your Uploadthing dashboard
2. Check **Files** tab
3. You should see your uploaded files

## File Validation

Uploadthing enforces these limits:

### Images
- **Max size:** 5MB
- **Allowed types:** JPG, PNG, GIF, WEBP
- **Max count:** 1 file per upload

### Videos
- **Max size:** 100MB
- **Allowed types:** MP4, MOV, WEBM
- **Max count:** 1 file per upload

## Security Considerations

### Add Authentication (Recommended)

To restrict uploads to authenticated users, modify the middleware:

```typescript
.middleware(async ({ req }) => {
  // Get user session
  const session = await getServerSession();

  // Check if user is authenticated
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Return user metadata
  return { userId: session.user.id };
})
```

### File Type Validation

Uploadthing validates files on **both client and server**:
- Client: Shows file picker with type filter
- Server: Validates file type and size before upload

## Troubleshooting

### Issue: "API key not found"

**Solution:**
1. Check `.env` file has correct keys
2. Restart development server
3. Verify keys in Uploadthing dashboard

### Issue: "CORS error"

**Solution:**
1. Add `http://localhost:3000` to Allowed Origins in Uploadthing dashboard
2. Check `UPLOADTHING_URL` matches your app URL

### Issue: "Upload fails with 500 error"

**Solution:**
1. Check browser console for errors
2. Check `logs/dev.log` for server errors
3. Verify Uploadthing API keys are correct

### Issue: "File not accessible after upload"

**Solution:**
1. Check Uploadthing dashboard Files tab
2. Verify file URL is correct
3. Check file permissions in Uploadthing settings

## Migration from Local/S3 Storage

If you have existing files in local storage or S3, you can migrate them to Uploadthing:

### Manual Migration
1. Download files from `public/uploads/` or S3
2. Upload to Uploadthing dashboard
3. Update file URLs in database

### Automated Migration (Future)
A migration script can be created to:
1. Scan database for file references
2. Download from current storage
3. Upload to Uploadthing
4. Update URLs in database

## Cost & Limits

### Free Tier (Uploadthing)
- **Storage:** 2GB
- **Bandwidth:** 10GB/month
- **Requests:** Unlimited

### Pricing Plans
See [uploadthing.com/pricing](https://uploadthing.com/pricing) for details.

## Comparison: Uploadthing vs S3 vs Local

| Feature | Uploadthing | AWS S3 | Local |
|---------|-------------|--------|-------|
| **Setup** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Easy |
| **Cost** | Free tier available | Pay-per-use | Free |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ Limited |
| **CDN** | Included | Optional (CloudFront) | None |
| **File Processing** | Built-in | Manual | None |
| **Best For** | Quick setup, MVP | Production, scale | Development |

## Next Steps

1. ✅ Uploadthing packages installed
2. ✅ API route configured
3. ✅ Environment variables ready
4. ⬜ **Your task:** Add API keys to `.env`
5. ⬜ **Your task:** Configure CORS in Uploadthing dashboard
6. ⬜ **Your task:** Test file upload

## Resources

- **Uploadthing Docs:** [docs.uploadthing.com](https://docs.uploadthing.com)
- **GitHub:** [github.com/uploadthing/uploadthing](https://github.com/uploadthing/uploadthing)
- **Discord:** [discord.gg/uploadthing](https://discord.gg/uploadthing)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Check Uploadthing dashboard for errors
3. Check `logs/dev.log` for server errors
4. Visit Uploadthing Discord community

---

**Status:** ✅ Uploadthing integration complete - ready for configuration!

**Last Updated:** 2026-01-07
