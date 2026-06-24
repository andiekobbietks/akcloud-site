// netlify/functions/save-config.js
// Saves site-wide config via Netlify API. Requires admin auth.

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

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

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const { booking_url } = body;
  if (!booking_url || !booking_url.startsWith('http')) {
    return new Response(JSON.stringify({ error: 'Invalid booking_url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const siteId = process.env.NETLIFY_SITE_ID || '';
  const token = process.env.NETLIFY_API_TOKEN || '';
  if (!siteId || !token) {
    return new Response(JSON.stringify({ error: 'Missing Netlify API credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const envVars = [
      { key: 'BOOKING_URL', values: [booking_url], scopes: ['functions'] },
      { key: 'CONFIG_UPDATED_AT', values: [new Date().toISOString()], scopes: ['functions'] },
    ];

    for (const v of envVars) {
      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/${v.key}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(v),
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      booking_url,
      message: 'Config saved. Changes take effect on next deploy.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/.netlify/functions/save-config' };
