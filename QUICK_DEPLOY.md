# Quick Deploy Guide

## One-Command Deploy

Just run this from your project directory:

```bash
./deploy-worker.sh
```

This script will:
1. ✅ Check if Wrangler is installed (install if needed)
2. ✅ Login to Cloudflare
3. ✅ Create R2 buckets
4. ✅ Deploy your worker
5. ✅ Give you the worker URL

## After Deployment

### 1. Update App with Worker URL

The deploy script will show you a URL like:
```
https://geosonnet-video-upload.your-subdomain.workers.dev
```

Open [app.js](app.js) and update line 1017:

```javascript
const UPLOAD_CONFIG = {
    workerUrl: 'https://geosonnet-video-upload.your-subdomain.workers.dev'
};
```

### 2. Make R2 Bucket Public

Go to your Cloudflare Dashboard:
https://dash.cloudflare.com/66f906f29f28b08ae9c80d4f36e25c7a/r2/default/buckets/geosonnet-videos

1. Click **Settings** → **Public Access**
2. Click **Allow Access**
3. Copy the public URL (looks like: `https://pub-xxxxx.r2.dev`)

### 3. Update Worker with Public URL

Open [cloudflare-worker.js](cloudflare-worker.js) and update line 32:

```javascript
const publicUrl = `https://pub-xxxxx.r2.dev/${filename}`;
```

### 4. Re-deploy Worker

```bash
wrangler deploy
```

### 5. Test It!

1. Open your app
2. Click Start → Record
3. Stop recording
4. You should see "Upload complete! 🎉" and a QR code

## That's It!

No Railway, no servers, no complicated setup. Just Cloudflare Workers + R2. 🚀

Total cost: **$0** (free tier is plenty for AGU showcase)

## Troubleshooting

If upload fails:
```bash
# Check worker logs
wrangler tail
```

Then try recording again - you'll see live logs!
