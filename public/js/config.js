// R.D.F - Central configuration
// --------------------------------------------
// This app has a Node.js/Express BACKEND (server.js).
// GitHub Pages CANNOT run that backend, so you must host the
// backend on a Node.js platform (Render, Railway, Koyeb, Fly.io, DigitalOcean, etc).
//
// 1) Deploy this whole repo to a Node.js platform. Your backend
//    will get a URL like: https://rdf.onrender.com
// 2) Set API_BASE below to that URL.
// 3) Everything (frontend + backend) can be served from ONE url,
//    OR the frontend can be hosted separately on GitHub Pages while
//    pointing API_BASE to the backend.
// --------------------------------------------
// Replace this with your REAL backend URL after deploying.
window.API_BASE = window.API_BASE || 'https://rdf.onrender.com';

// Full Discord login URL (goes to the backend)
window.LOGIN_URL = window.LOGIN_URL || window.API_BASE + '/api/auth/discord';

// ---- Global fetch wrapper ----
// Automatically prepend API_BASE to any relative /api/ request so the
// frontend works even when it is NOT served from the same host as the backend.
// This runs BEFORE any load of the app so all existing fetch('/api/...') calls
// hit the correct backend automatically.
(function () {
  if (typeof window === 'undefined' || !window.fetch || window.__apiFetchPatched) return;
  window.__apiFetchPatched = true;

  const nativeFetch = window.fetch.bind(window);
  const BASE = (window.API_BASE || '').replace(/\/+$/, '');

  window.fetch = function (input, init) {
    // Only rewrite relative paths that start with /api/
    if (typeof input === 'string' && input.indexOf('/api/') === 0 && BASE) {
      input = BASE + input;
    }
    // Handle Request objects
    else if (input && typeof input === 'object' && typeof input.url === 'string' && input.url.indexOf('/api/') === 0 && BASE) {
      const reqInit = { ...input };
      reqInit.url = BASE + input.url;
      return nativeFetch(reqInit, init);
    }
    return nativeFetch(input, init);
  };
})();

