# Cloudflare Worker Setup Guide

Much simpler than Google Drive! Just deploy a Cloudflare Worker and you're done. 🎉

## Prerequisites

1. A Cloudflare account (free tier works!)
2. Node.js installed
3. Wrangler CLI installed: `npm install -g wrangler`

## Step 1: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

## Step 2: Create R2 Bucket for Video Storage

```bash
# Create production bucket
wrangler r2 bucket create geosonnet-videos

# Create preview bucket for development
wrangler r2 bucket create geosonnet-videos-preview
```

## Step 3: Deploy the Worker

From your project directory:

```bash
wrangler deploy
```

That's it! Wrangler will:
- Upload your worker code
- Bind the R2 bucket
- Give you a URL like: `https://geosonnet-video-upload.YOUR-SUBDOMAIN.workers.dev`

## Step 4: Update Your App Configuration

Open [app.js](app.js) and update the worker URL (around line 1023):

```javascript
const UPLOAD_CONFIG = {
    workerUrl: 'https://geosonnet-video-upload.YOUR-SUBDOMAIN.workers.dev'
};
```

Replace `YOUR-SUBDOMAIN` with your actual Cloudflare subdomain (you'll get this after deploying).

## Step 5: Make R2 Bucket Public (Optional but Recommended)

For the simplest setup, make your R2 bucket publicly accessible:

1. Go to Cloudflare Dashboard → R2
2. Click on `geosonnet-videos` bucket
3. Go to Settings → Public Access
4. Click "Allow Access"
5. Copy the public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)

Then update the worker code (cloudflare-worker.js line 32):

```javascript
const publicUrl = `https://pub-xxxxx.r2.dev/${filename}`;
```

## Alternative: Custom Domain (Advanced)

If you want a custom domain like `videos.geosonnet.org`:

1. In Cloudflare Dashboard → R2 → `geosonnet-videos`
2. Go to Settings → Custom Domains
3. Add your custom domain
4. Update worker code:

```javascript
const publicUrl = `https://videos.geosonnet.org/${filename}`;
```

## Testing

1. Open your app
2. Click Start → Record
3. Stop recording
4. Video should upload and show a QR code!

## Cost

**FREE for reasonable usage!**

- R2 Storage: 10 GB free/month
- Worker requests: 100,000 free/month
- R2 requests: 1 million reads/month free

For AGU showcase, this should be way more than enough!

## Troubleshooting

### "Upload failed" error
- Check the browser console for error messages
- Verify the worker URL is correct
- Make sure R2 bucket is created and bound

### CORS errors
- The worker already has CORS headers configured
- If using a custom domain, make sure it's properly configured in Cloudflare

### Videos not loading
- Check if R2 bucket is public
- Verify the public URL in the worker code matches your bucket's public URL

## Monitoring

View worker logs:

```bash
wrangler tail
```

This shows real-time logs as videos are uploaded!

## Cleanup

To delete everything:

```bash
# Delete worker
wrangler delete

# Delete R2 buckets
wrangler r2 bucket delete geosonnet-videos
wrangler r2 bucket delete geosonnet-videos-preview
```

## Why This is Better Than Google Drive

✅ No OAuth setup
✅ No user sign-in
✅ No API keys to manage
✅ Simpler code
✅ Faster uploads
✅ Free tier is generous
✅ Better for kiosks

Perfect for your AGU showcase! 🚀
