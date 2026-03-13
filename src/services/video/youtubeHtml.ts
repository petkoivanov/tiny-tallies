/**
 * Builds an inline HTML string that embeds a YouTube video via the
 * youtube-nocookie.com domain for COPPA compliance (no tracking cookies).
 *
 * Used with react-native-webview source={{ html }} — this bypasses the
 * react-native-youtube-iframe library's IFrame API callbacks intentionally.
 * A "Done watching" button is used instead of video-end event detection
 * (IFrame API postMessage bridge is unavailable in this approach).
 *
 * Anti-patterns avoided:
 * - No baseUrlOverride external fetch (Issue #337 timeout risk)
 * - No www.youtube.com domain (COPPA requires nocookie variant)
 * - No modestbranding reliance (deprecated by YouTube in 2023; harmless to include)
 */
export function buildNocookieHtml(videoId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1"
    allow="autoplay; encrypted-media"
    allowfullscreen>
  </iframe>
</body>
</html>`;
}
