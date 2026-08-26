// Live-Reload Module
// Computes a fingerprint (hash) of the project's source files.
// The browser polls /__live_reload and reloads when the fingerprint changes.
// Works on ANY host (Render, localhost, etc.) because it only uses HTTP.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Files to watch for changes (relative to this project root)
const WATCH_FILES = [
  'server.js',
  'live-reload.js',
  'db.js',
  'bot.js',
  'patch-logs.js',
  'package.json',
  'render.yaml',
  'public/index.html',
  'public/dashboard.html',
  'public/members.html',
  'public/designer.html',
  'public/css/style.css',
  'public/js/app.js',
  'public/js/config.js',
  'public/js/login.js',
  'public/js/live-reload-client.js',
];

// Root directory of the project (parent of this file)
const ROOT = __dirname;

// Compute the combined fingerprint of all watch files
function computeFingerprint() {
  const hash = crypto.createHash('md5');
  for (const rel of WATCH_FILES) {
    const full = path.join(ROOT, rel);
    try {
      const content = fs.readFileSync(full);
      hash.update(rel);
      hash.update(content);
    } catch (err) {
      // File missing -> update with a marker so removal also triggers a reload
      hash.update('MISSING:' + rel);
    }
  }
  return hash.digest('hex');
}

// Express middleware that exposes the fingerprint endpoint
function liveReload(app) {
  const ENABLED =
    process.env.ENABLE_LIVE_RELOAD !== 'false' &&
    process.env.NODE_ENV !== 'production';

  // Endpoint the client polls
  app.get('/__live_reload', (req, res) => {
    if (!ENABLED) {
      return res.status(404).json({ enabled: false });
    }
    res.json({ enabled: true, fingerprint: computeFingerprint() });
  });

  // Log state
  if (ENABLED) {
    console.log('🔁 Live Reload: ENABLED (auto-refresh on code change)');
  } else {
    console.log('🔁 Live Reload: disabled');
  }
}

module.exports = { liveReload, computeFingerprint, ENABLED: true };
