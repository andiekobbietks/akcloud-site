// netlify/functions/get-waitlist.js
// ──────────────────────────────────────────────────────────────
// Returns recent form submissions as JSON for the admin dashboard.
//
// Requires basic auth (set ADMIN_USER + ADMIN_PASS in Netlify env).
// Auth is checked via the Authorization header — Netlify will return
// 401 if missing/wrong.
//
// This complements admin.html's localStorage waitlist view by letting
// the admin see ALL signups, not just the ones made on this browser.
//
// To use from admin.html, fetch('/api/get-waitlist') with credentials.

const NETLIFY_API = 'https://api.netlify.com/api/v1';

export default async (request) => {
  // ── Auth ──
  const auth = request.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(
    `${process.env.ADMIN_USER || ''}:${process.env.ADMIN_PASS || ''}`
  );
  if (!process.env.ADMIN_USER || auth !== expected) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="AKcloud admin"' },
    });
  }

  // ── Fetch submissions from Netlify Forms API ──
  const siteId = process.env.NETLIFY_SITE_ID || '';
  const token  = process.env.NETLIFY_API_TOKEN || '';

  if (!siteId || !token) {
    return new Response(JSON.stringify({
      error: 'Missing NETLIFY_SITE_ID or NETLIFY_API_TOKEN env vars',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const url = `${NETLIFY_API}/sites/${siteId}/submissions/?per_page=100`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({
        error: `Netlify API returned ${res.status}`,
      }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }

    const submissions = await res.json();

    // Normalise into a clean shape
    const cleaned = submissions
      .filter(s => s.form_name === 'notify' || s.form_name === 'consultation')
      .map(s => ({
        id: s.id,
        form: s.form_name,
        email: s.data?.email || '',
        company: s.data?.company || '',
        topic: s.data?.topic || '',
        source: s.data?.source || '',
        created_at: s.created_at,
        ip: s.client_ip,
        user_agent: s.user_agent,
      }));

    return new Response(JSON.stringify({
      count: cleaned.length,
      submissions: cleaned,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/.netlify/functions/get-waitlist' };