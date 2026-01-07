# Uploadthing Setup Guide

This document explains how Uploadthing is configured for cloud file storage in the Notes App.

## Overview

Uploadthing provides a simple, developer-friendly file upload solution. It's configured as the primary storage method for images and videos in the notes app.

## Current Configuration

### File Router (`src/lib/uploadthing.ts`)

The file router defines what types of files can be uploaded:

```typescript
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "100MB",
      maxFileCount: 1,
    },
  })
}
```

### API Route (`src/app/api/uploadthing/[slug]/route.ts`)

The API route handles upload requests:

```typescript
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl: process.env.UPLOADTHING_URL,
  },
});
```

## Environment Variables

Add these to your `.env` file:

```bash
# Uploadthing (optional - for cloud file storage)
# Get your API keys from: https://uploadthing.com/dashboard
UPLOADTHING_APP_ID=""
UPLOADTHING_SECRET=""
UPLOADTHING_URL="http://localhost:3000/api/uploadthing"
```

### Getting API Keys

1. Go to https://uploadthing.com/dashboard
2. Create a new app or select existing one
3. Copy your App ID and Secret
4. Add them to your `.env` file

## File Upload Limits

- **Images**: Maximum 5MB per file
- **Videos**: Maximum 100MB per file
- **File Count**: 1 file at a time (per upload)

## Testing

Run the test script to verify configuration:

```bash
node test_uploadthing_setup.js
```

This will check:
- Environment variables are set (optional for local dev)
- File router configuration exists
- API route exists
- Dependencies are installed
- File type and size validations are configured

## How It Works

### Upload Flow

1. User selects a file in the note editor
2. File is uploaded to Uploadthing via `/api/uploadthing` endpoint
3. Uploadthing stores the file and returns a URL
4. URL is saved with the note content
5. File is displayed in the note using the URL

### Local Fallback

If Uploadthing credentials are not configured, the app falls back to local storage using the S3/local storage system defined in `src/lib/storage.ts`.

## CORS Configuration

Uploadthing automatically handles CORS for localhost development. No additional configuration is needed.

## Production Deployment

To enable Uploadthing in production:

1. Add your Uploadthing API keys to your hosting platform's environment variables
2. Ensure `UPLOADTHING_URL` points to your production API endpoint
3. Deploy the app

Example production environment variables:

```bash
UPLOADTHING_APP_ID="your-production-app-id"
UPLOADTHING_SECRET="your-production-secret"
UPLOADTHING_URL="https://your-app.com/api/uploadthing"
```

## Troubleshooting

### Uploads Not Working

1. Check that API keys are set correctly in `.env`
2. Verify the server is running: `npm run dev`
3. Check browser console for errors
4. Run test script: `node test_uploadthing_setup.js`

### CORS Errors

Uploadthing handles CORS automatically. If you see CORS errors:
- Verify you're using the correct API endpoint
- Check that `UPLOADTHING_URL` is set correctly
- Ensure Uploadthing dashboard has your domain allowed

### File Size Errors

If uploads fail with size errors:
- Check file size against limits (5MB for images, 100MB for videos)
- Adjust limits in `src/lib/uploadthing.ts` if needed
- Ensure file is not corrupted

## Related Files

- `src/lib/uploadthing.ts` - File router configuration
- `src/app/api/uploadthing/[slug]/route.ts` - API route handler
- `src/lib/storage.ts` - Storage fallback logic
- `test_uploadthing_setup.js` - Configuration test script

## Resources

- Uploadthing Docs: https://docs.uploadthing.com
- Uploadthing Dashboard: https://uploadthing.com/dashboard
- GitHub: https://github.com/uploadthing/uploadthing
