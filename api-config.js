const cfg = window.DOKINESIA_CONFIG || {};
const LOCAL_DEV = 'http://localhost:3001';
const IS_HTTP = location.protocol === 'http:' || location.protocol === 'https:';
const IS_LOCAL = IS_HTTP && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

function resolveApi() {
  if (!IS_HTTP) {
    const origin = stripTrailingSlash(cfg.apiUrl || LOCAL_DEV);
    return { origin, base: `${origin}/api` };
  }

  if (IS_LOCAL) {
    return { origin: location.origin, base: '/api' };
  }

  const origin = stripTrailingSlash(cfg.apiUrl || location.origin);
  return { origin, base: `${origin}/api` };
}

const api = resolveApi();
const API_ORIGIN = api.origin;
const API_BASE_URL = api.base;
const UPLOADS_ORIGIN = stripTrailingSlash(cfg.uploadsUrl || api.origin);
