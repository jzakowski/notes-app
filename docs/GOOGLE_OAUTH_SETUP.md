# Google OAuth Setup Guide

This guide explains how to configure Google OAuth authentication for the Notes app.

## Prerequisites

- A Google Cloud account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Notes App")
5. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Enter app name: "Notes App"
   - Add your email as developer contact
   - Save and continue (skip scopes for now)
4. Select application type: "Web application"
5. Name: "Notes App Web Client"
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Click "Create"

### 4. Copy Credentials

After creating the OAuth client, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Copy this value

### 5. Update Environment Variables

Add the credentials to your `.env` file:

```bash
# Google OAuth
GOOGLE_ID="your-actual-client-id-here"
GOOGLE_SECRET="your-actual-client-secret-here"
```

Replace the placeholder values with your actual credentials.

### 6. Restart the Development Server

After updating the `.env` file, restart your Next.js development server:

```bash
npm run dev
```

## Testing Google OAuth

1. Navigate to `http://localhost:3000/auth/login`
2. Click the "Continue with Google" button
3. Sign in with your Google account
4. You should be redirected to `/notes` and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

This means the redirect URI in your Google Cloud Console doesn't match what NextAuth is using.

**Solution:**
- Make sure you added: `http://localhost:3000/api/auth/callback/google`
- Check that there are no trailing slashes
- Verify the port number matches your dev server

### Error: "Invalid Client"

This means the Client ID or Client Secret is incorrect.

**Solution:**
- Double-check your `.env` file has the correct values
- Make sure you copied the entire Client ID and Secret
- Restart the dev server after updating `.env`

### Error: "Access blocked: Authorization request denied"

This happens when the OAuth consent screen hasn't been configured properly.

**Solution:**
- Go to "OAuth consent screen" in Google Cloud Console
- Make sure you've filled out all required fields
- For development, "External" user type is fine

## Production Deployment

For production, you'll need to:

1. Add your production domain as an authorized JavaScript origin
2. Add your production callback URL as an authorized redirect URI
3. Update your production environment variables with the same credentials

## Security Notes

- **NEVER** commit your `.env` file to version control
- **NEVER** share your Client Secret publicly
- Keep your Google Cloud Console secure with 2FA
- Regularly rotate your OAuth credentials

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
