#!/bin/bash

echo "🚀 Deploying Geo SonNet Video Upload Worker..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "📝 Checking Cloudflare login..."
wrangler whoami || wrangler login

echo ""
echo "📦 Creating R2 buckets..."

# Create production bucket
echo "Creating geosonnet-videos bucket..."
wrangler r2 bucket create geosonnet-videos 2>/dev/null || echo "✓ Bucket already exists"

# Create preview bucket
echo "Creating preview bucket..."
wrangler r2 bucket create geosonnet-videos-preview 2>/dev/null || echo "✓ Preview bucket already exists"

echo ""
echo "🚀 Deploying worker..."
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your worker URL (shown above)"
echo "2. Update app.js line 1017 with your worker URL"
echo "3. Make your R2 bucket public (see instructions below)"
echo ""
echo "To make R2 bucket public:"
echo "1. Go to: https://dash.cloudflare.com/66f906f29f28b08ae9c80d4f36e25c7a/r2/default/buckets/geosonnet-videos"
echo "2. Click 'Settings' → 'Public Access'"
echo "3. Click 'Allow Access'"
echo "4. Copy the public URL (e.g., https://pub-xxxxx.r2.dev)"
echo "5. Update cloudflare-worker.js line 32 with your public URL"
echo ""
