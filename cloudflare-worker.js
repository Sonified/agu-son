// Cloudflare Worker for Geo SonNet Video Uploads
// Deploy this to Cloudflare Workers and update the WORKER_URL in app.js

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST') {
      try {
        // Get the video blob from the request
        const formData = await request.formData();
        const videoFile = formData.get('video');

        if (!videoFile) {
          return new Response('No video file provided', { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `geosonnet_${timestamp}.webm`;

        // Store in R2 (Cloudflare Object Storage)
        // You'll need to bind an R2 bucket named 'VIDEOS' in wrangler.toml
        await env.VIDEOS.put(filename, videoFile);

        // Generate public URL
        // Option 1: Use R2 public bucket URL (if you enable public access)
        const publicUrl = `https://your-r2-public-domain.com/${filename}`;

        // Option 2: Use a custom domain with worker serving the file
        // const publicUrl = `https://videos.geosonnet.org/${filename}`;

        return new Response(JSON.stringify({
          success: true,
          url: publicUrl,
          filename: filename
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Serve video files (if you want to serve them through the worker)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const filename = url.pathname.slice(1); // Remove leading slash

      if (filename) {
        const object = await env.VIDEOS.get(filename);

        if (object === null) {
          return new Response('Video not found', { status: 404 });
        }

        return new Response(object.body, {
          headers: {
            'Content-Type': 'video/webm',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Geo SonNet Video Upload Service', { status: 200 });
  },
};
