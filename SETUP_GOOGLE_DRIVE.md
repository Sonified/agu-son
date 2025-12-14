# Google Drive Integration Setup Guide

This guide will walk you through setting up Google Drive integration for the video recording feature.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Geo SonNet AGU")
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API" and click **Enable**

## Step 3: Create OAuth Credentials

### Create OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Geo SonNet
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the "Scopes" page, click **Save and Continue** (we'll add scopes in the credentials)
7. On the "Test users" page, add your email as a test user
8. Click **Save and Continue**

### Create OAuth Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Give it a name (e.g., "Geo SonNet Web Client")
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost` (for local testing)
   - Your production domain (e.g., `https://yourdomain.com`)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost` (for local testing)
   - Your production domain (e.g., `https://yourdomain.com`)
7. Click **Create**
8. **Copy the Client ID** - you'll need this!

### Create API Key

1. In **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. **Copy the API Key** - you'll need this!
4. Click **Restrict Key** (recommended)
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Drive API" from the dropdown
   - Click **Save**

## Step 4: Update Your Code

Open [app.js](app.js) and find the `GOOGLE_CONFIG` object (around line 1016):

```javascript
const GOOGLE_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    apiKey: 'YOUR_API_KEY_HERE',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/drive.file'
};
```

Replace:
- `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com` with your **OAuth Client ID**
- `YOUR_API_KEY_HERE` with your **API Key**

## Step 5: Test the Integration

1. Open your app in a browser
2. Click "Start" to begin the camera
3. Click "Record" to start recording
4. When you stop recording, you'll be prompted to sign in to Google
5. After signing in, the video will upload to your Google Drive
6. A QR code will appear with a shareable link!

## Step 6: Publishing Your App (Optional)

If you want to make this available to users beyond test users:

1. Go back to **OAuth consent screen**
2. Click **Publish App**
3. Submit for verification (Google will review your app)

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you've added your domain to **Authorized JavaScript origins**
- Make sure you've enabled the Google Drive API

### "The OAuth client was not found"
- Double-check that you copied the Client ID correctly
- Make sure the Client ID ends with `.apps.googleusercontent.com`

### Video uploads but QR code doesn't generate
- Check the browser console for errors
- Make sure the QR code library loaded correctly

### Videos are uploading to the wrong account
- The videos upload to whoever is signed in during the OAuth flow
- For a kiosk, sign in once with your account and the token will persist

## Adding Logos

To add the Geo SonNet and AGU 2025 logos to the videos:

1. Place your logo image files in the project directory (e.g., `geosonnet-logo.png`, `agu2025-logo.png`)
2. Open [app.js](app.js)
3. Find the `createSocialMediaCanvas` function (around line 1080)
4. Look for the comment `// TODO: Add logos here when provided`
5. Add code to load and draw the images:

```javascript
// Load and draw Geo SonNet logo (top left)
const geoLogo = new Image();
geoLogo.src = 'geosonnet-logo.png';
geoLogo.onload = () => {
    finalCtx.drawImage(geoLogo, 40, 40, 150, 150); // Adjust size as needed
};

// Load and draw AGU 2025 logo (top right)
const aguLogo = new Image();
aguLogo.src = 'agu2025-logo.png';
aguLogo.onload = () => {
    finalCtx.drawImage(aguLogo, finalCanvas.width - 190, 40, 150, 150); // Adjust size as needed
};
```

Note: You may want to preload these images at app startup for better performance.

## Questions?

If you run into any issues, check the browser console for error messages and refer to the [Google Drive API documentation](https://developers.google.com/drive/api/v3/about-sdk).
