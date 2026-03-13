/**
 * Builds an inline HTML string that embeds a YouTube video via the
 * youtube-nocookie.com domain for COPPA compliance (no tracking cookies).
 *
 * Used with react-native-webview source={{ html }} — this bypasses the
 * react-native-youtube-iframe library's IFrame API callbacks intentionally.
 * A "Done watching" button is used instead of video-end event detection.
 *
 * End-screen suppression: enablejsapi=1 + postMessage listener detects state 0
 * (video ended) and displays a full-screen overlay blocking YouTube's related
 * videos grid. This is the only reliable approach — rel=0 alone only limits
 * related videos to the same channel, not zero.
 *
 * Anti-patterns avoided:
 * - No baseUrlOverride external fetch (Issue #337 timeout risk)
 * - No www.youtube.com domain (COPPA requires nocookie variant)
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
    #end-overlay {
      display: none;
      position: fixed; inset: 0;
      background: #000;
      color: #fff;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      font-size: 18px;
      text-align: center;
      padding: 24px;
    }
    #end-overlay.visible { display: flex; }
  </style>
</head>
<body>
  <iframe
    id="player"
    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&enablejsapi=1"
    allow="autoplay; encrypted-media"
    allowfullscreen>
  </iframe>
  <div id="end-overlay">
    <p>Video complete!<br><br>Tap <strong>Done watching</strong> below to continue.</p>
  </div>
  <script>
    // YouTube IFrame API sends postMessage events with JSON payloads.
    // State 0 = ended. Cover the iframe to block the related-videos end screen.
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
          document.getElementById('end-overlay').classList.add('visible');
        }
      } catch (_) {}
    });
  </script>
</body>
</html>`;
}
