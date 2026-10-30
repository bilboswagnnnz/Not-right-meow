/**
 * Not Right Meow — short-lived, end-to-end encrypted QR pairing relay.
 *
 * Does NOT host player accounts or access the leaderboard.
 * Both browsers create ECDH keys. Only encrypted player credentials travel
 * through this service; the PC's private key never leaves that browser.
 */
const TTL_SECONDS = 120;
const ID_RE = /^[A-Za-z0-9_-]{22}$/;
const SECRET_RE = /^[A-Za-z0-9_-]{43}$/;
const KEY_RE = /^[A-Za-z0-9_-]{87}$/; // raw, uncompressed P-256 public key
const IV_RE = /^[A-Za-z0-9_-]{16}$/;
const CIPHER_RE = /^[A-Za-z0-9_-]{40,2048}$/;

function response(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', ...headers }
  });
}
function cors(origin) {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type', Vary: 'Origin' };
}
function error(message, status, headers) { return response({ error: message }, status, headers); }
async function bodyJSON(request) {
  const raw = await request.text();
  if (raw.length > 8192) throw new Error('Request too large.');
  return JSON.parse(raw);
}
async function sha256Base64Url(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const bytes = new Uint8Array(hash);
  let s = '';
  for (const byte of bytes) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function claimSecret(request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}
export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
    const origin = request.headers.get('Origin');
    if (!allowed || !env.DB) return error('Pairing service not configured.', 503);
    // CORS is for browser isolation, not authentication: pairing secrets are
    // high-entropy and required separately for fetching approved messages.
    if (origin && origin !== allowed) return error('Origin not allowed.', 403);
    const headers = cors(allowed);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    const path = url.pathname;
    const now = Math.floor(Date.now() / 1000);
    try {
      if (path === '/api/pair/health' && request.method === 'GET') {
        await env.DB.prepare('SELECT 1').first();
        return response({ ok: true }, 200, headers);
      }
      if (path === '/api/pair/start' && request.method === 'POST') {
        const b = await bodyJSON(request);
        if (!ID_RE.test(b.id || '') || !SECRET_RE.test(b.verifier || ''))
          return error('Invalid pairing request.', 400, headers);
        // Best-effort deletion after expiry; no tracking database of players.
        await env.DB.prepare('DELETE FROM pairing_sessions WHERE expires_at < ?').bind(now - 60).run();
        try {
          await env.DB.prepare(
            "INSERT INTO pairing_sessions (id, verifier, state, created_at, expires_at) VALUES (?, ?, 'pending', ?, ?)"
          ).bind(b.id, b.verifier, now, now + TTL_SECONDS).run();
        } catch {
          return error('Pairing session already exists. Retry.', 409, headers);
        }
        return response({ state: 'pending', expiresAt: (now + TTL_SECONDS) * 1000 }, 201, headers);
      }
      if (path === '/api/pair/approve' && request.method === 'POST') {
        const b = await bodyJSON(request);
        if (!ID_RE.test(b.id || '') || !KEY_RE.test(b.phoneKey || '') ||
            !IV_RE.test(b.iv || '') || !CIPHER_RE.test(b.ciphertext || ''))
          return error('Invalid encrypted approval.', 400, headers);
        const payload = JSON.stringify({ phoneKey: b.phoneKey, iv: b.iv, ciphertext: b.ciphertext });
        const result = await env.DB.prepare(
          "UPDATE pairing_sessions SET state = 'approved', payload = ? WHERE id = ? AND state = 'pending' AND expires_at > ?"
        ).bind(payload, b.id, now).run();
        if (!result.meta?.changes) return error('Session expired, already used, or invalid.', 410, headers);
        return response({ state: 'approved' }, 200, headers);
      }
      if (path === '/api/pair/status' && request.method === 'GET') {
        const id = url.searchParams.get('id') || '';
        const secret = claimSecret(request);
        if (!ID_RE.test(id) || !SECRET_RE.test(secret)) return error('Invalid link credentials.', 403, headers);
        const verifier = await sha256Base64Url(secret);
        const row = await env.DB.prepare(
          'SELECT state, expires_at FROM pairing_sessions WHERE id = ? AND verifier = ?'
        ).bind(id, verifier).first();
        if (!row) return error('Session not found.', 404, headers);
        if (row.expires_at <= now || row.state === 'cancelled' || row.state === 'consumed')
          return error('Session expired or already used.', 410, headers);
        if (row.state === 'pending') return response({ state: 'pending' }, 200, headers);
        // Atomic, single-use pickup. The secret never appears in QR or URL.
        const result = await env.DB.prepare(
          "UPDATE pairing_sessions SET state = 'consumed' WHERE id = ? AND verifier = ? AND state = 'approved' AND expires_at > ? RETURNING payload"
        ).bind(id, verifier, now).first();
        if (!result?.payload) return error('Session already redeemed.', 410, headers);
        // Do not retain the encrypted payload after delivery.
        await env.DB.prepare('UPDATE pairing_sessions SET payload = NULL WHERE id = ?').bind(id).run();
        return response({ state: 'approved', ...JSON.parse(result.payload) }, 200, headers);
      }
      if (path === '/api/pair/cancel' && request.method === 'POST') {
        const b = await bodyJSON(request);
        const secret = claimSecret(request);
        if (!ID_RE.test(b.id || '') || !SECRET_RE.test(secret)) return error('Invalid link credentials.', 403, headers);
        const verifier = await sha256Base64Url(secret);
        await env.DB.prepare(
          "UPDATE pairing_sessions SET state = 'cancelled', payload = NULL WHERE id = ? AND verifier = ? AND state IN ('pending', 'approved')"
        ).bind(b.id, verifier).run();
        return response({ state: 'cancelled' }, 200, headers);
      }
      return error('Not found.', 404, headers);
    } catch (e) {
      if (e instanceof SyntaxError || e.message === 'Request too large.')
        return error('Invalid request data.', 400, headers);
      // Do not return SQL details or sensitive session contents.
      return error('Pairing service temporarily unavailable.', 500, headers);
    }
  }
};
