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

        // Get filename from uploaded file (preserves .mp4 or .webm extension)
        const originalFilename = videoFile.name;
        const extension = originalFilename.split('.').pop();
        const timestamp = Date.now();
        const filename = `geosonnet_${timestamp}.${extension}`;

        // Store in R2 (Cloudflare Object Storage)
        // You'll need to bind an R2 bucket named 'VIDEOS' in wrangler.toml
        await env.VIDEOS.put(filename, videoFile);

        // Generate URL - worker will serve the video (R2 bucket stays PRIVATE!)
        const workerUrl = new URL(request.url).origin;
        const publicUrl = `${workerUrl}/${filename}`;

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

    // Serve video files or landing page
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check for /video/ path - serve HTML landing page
      if (pathname.startsWith('/video/')) {
        const filename = pathname.slice(7); // Remove '/video/'

        if (filename) {
          const object = await env.VIDEOS.get(filename);

          if (object === null) {
            return new Response('Video not found', { status: 404 });
          }

          // Determine content type
          const contentType = filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

          // Generate landing page HTML
          const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Geo SonNet Experience ✨</title>

    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:title" content="My Geo SonNet Experience at AGU 2025 🎵">
    <meta property="og:description" content="Watch my movement sonification created at AGU 2025!">
    <meta property="og:type" content="video.other">
    <meta property="og:url" content="${url.origin}/video/${filename}">
    <meta property="og:video" content="${url.origin}/raw/${filename}">
    <meta property="og:video:secure_url" content="${url.origin}/raw/${filename}">
    <meta property="og:video:type" content="${contentType}">
    <meta property="og:video:width" content="1080">
    <meta property="og:video:height" content="1080">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="player">
    <meta name="twitter:title" content="My Geo SonNet Experience at AGU 2025 🎵">
    <meta name="twitter:description" content="Watch my movement sonification created at AGU 2025!">
    <meta name="twitter:player" content="${url.origin}/raw/${filename}">
    <meta name="twitter:player:width" content="1080">
    <meta name="twitter:player:height" content="1080">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background-attachment: fixed;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 600px;
            width: 100%;
        }
        h1 {
            font-size: 1.5em;
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            opacity: 0.9;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        video {
            width: 80%;
            border-radius: 12px;
            margin: 0 auto 15px auto;
            display: block;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .button-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        button, .download-btn {
            background: rgba(255, 255, 255, 0.9);
            color: #764ba2;
            border: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        button:hover, .download-btn:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        button:active, .download-btn:active {
            transform: translateY(0);
        }
        .share-btn {
            background: linear-gradient(135deg, #E1306C 0%, #F56040 50%, #FD8D32 100%);
            color: white;
            max-width: 80%;
            margin: 0 auto;
        }
        .share-btn:hover {
            background: linear-gradient(135deg, #E1306C 0%, #F56040 50%, #FD8D32 100%);
            filter: brightness(1.1);
        }
        .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 0.85em;
            opacity: 0.8;
        }
        .footer a {
            color: white;
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Geo SonNet Experience</h1>

        <video id="video" controls playsinline preload="auto">
            <source src="/raw/${filename}" type="${contentType}">
            Your browser doesn't support video playback.
        </video>

        <div class="button-group">
            <button class="share-btn" id="share-btn">
                <span>Share / Download Video</span>
            </button>
        </div>

        <div class="footer">
            Check out <a href="https://geosonnet.org" target="_blank">Geo SonNet</a><br>
            AGU 2025 • Washington, DC
        </div>
    </div>

    <script>
        // Web Share API for social media sharing
        const shareBtn = document.getElementById('share-btn');
        const video = document.getElementById('video');

        shareBtn.addEventListener('click', async () => {
            try {
                // Fetch the video blob
                const response = await fetch('/raw/${filename}');
                const blob = await response.blob();

                // Create File object from blob
                const file = new File([blob], '${filename}', { type: '${contentType}' });

                // Check if Web Share API is available
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'My Geo SonNet Experience',
                        text: 'Check out my movement sonification from AGU 2025! 🎵✨',
                        files: [file]
                    });
                    console.log('✓ Shared successfully!');
                } else {
                    // Fallback: just copy the URL
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied! Paste it into Instagram, TikTok, or any social media app.');
                }
            } catch (error) {
                console.error('Share failed:', error);
                // Fallback: copy URL to clipboard
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard! Paste it into your favorite social media app.');
                } catch (clipboardError) {
                    alert('To save to Photos: long-press the video above and select "Save Video"');
                }
            }
        });
    </script>
</body>
</html>`;

          return new Response(html, {
            headers: {
              'Content-Type': 'text/html',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      // Check for /raw/ path - serve raw video file
      if (pathname.startsWith('/raw/')) {
        const filename = pathname.slice(5); // Remove '/raw/'

        if (filename) {
          const object = await env.VIDEOS.get(filename);

          if (object === null) {
            return new Response('Video not found', { status: 404 });
          }

          // Determine content type based on file extension
          const contentType = filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

          return new Response(object.body, {
            headers: {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Accept-Ranges': 'bytes',
            },
          });
        }
      }

      // Check for /download/ path - force download
      if (pathname.startsWith('/download/')) {
        const filename = pathname.slice(10); // Remove '/download/'

        if (filename) {
          const object = await env.VIDEOS.get(filename);

          if (object === null) {
            return new Response('Video not found', { status: 404 });
          }

          const contentType = filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

          return new Response(object.body, {
            headers: {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        }
      }

      // Legacy support: direct filename access (backwards compatibility)
      const filename = pathname.slice(1); // Remove leading slash
      if (filename && !pathname.includes('/')) {
        const object = await env.VIDEOS.get(filename);

        if (object === null) {
          return new Response('Video not found', { status: 404 });
        }

        const contentType = filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

        return new Response(object.body, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Geo SonNet Video Upload Service', { status: 200 });
  },
};
