// Live-Reload Client (browser)
// Polls /__live_reload every 2 seconds. If the fingerprint changes,
// reload the page automatically. Only active when the endpoint is enabled.
(function () {
  // Skip if disabled via a global flag
  if (window.__LIVE_RELOAD_DISABLED) return;

  var POLL_INTERVAL = 2000; // ms
  var lastFingerprint = null;
  var firstRun = true;

  function check() {
    fetch('/__live_reload', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) {
          // Endpoint disabled (e.g. production) -> stop polling quietly
          if (!firstRun) clearInterval(timer);
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.enabled) return;
        if (firstRun) {
          lastFingerprint = data.fingerprint;
          firstRun = false;
          return;
        }
        if (data.fingerprint !== lastFingerprint) {
          console.log('🔁 Live reload: code changed, reloading...');
          location.reload();
        }
      })
      .catch(function () {
        // Ignore network errors; keep polling
      });
  }

  var timer = setInterval(check, POLL_INTERVAL);
  check();
})();
