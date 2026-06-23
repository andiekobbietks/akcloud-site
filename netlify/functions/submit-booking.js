// netlify/functions/submit-booking.js
// ──────────────────────────────────────────────────────────────
// Server-side proxy for Odoo booking submissions.
//
// Use case: instead of having the browser POST to your sovereign Odoo
// directly (which exposes the API key), the browser POSTs here, and
// this function talks to Odoo server-to-server using XML-RPC.
//
// Requires env vars (set in Netlify dashboard):
//   ODOO_URL      — e.g. https://odoo.akcloud.example.com
//   ODOO_DB       — database name
//   ODOO_USER     — API user email
//   ODOO_API_KEY  — generated in Odoo → Settings → Users → API Keys
//
// Browser usage:
//   fetch('/api/submit-booking', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       appointment_type_id: 1,
//       datetime: '2026-07-15 10:00:00',
//       name: 'John Smith',
//       email: 'john@example.com',
//       phone: '+44...',
//     }),
//   })
//
// Odoo XML-RPC docs:
//   https://www.odoo.com/documentation/18.0/developer/reference/external_api.html

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY } = process.env;
  if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Odoo env vars not configured',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const required = ['name', 'email', 'appointment_type_id', 'datetime'];
  for (const field of required) {
    if (!body[field]) {
      return new Response(JSON.stringify({
        error: `Missing required field: ${field}`,
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  try {
    // 1. Authenticate → get uid
    const commonUrl = `${ODOO_URL}/xmlrpc/2/common`;
    const authBody = XMLRPC.serialize('authenticate', [
      ODOO_DB, ODOO_USER, ODOO_API_KEY, {},
    ]);
    const authRes = await fetch(commonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': String(authBody.length),
      },
      body: authBody,
    });
    if (!authRes.ok) throw new Error(`Odoo auth HTTP ${authRes.status}`);
    const uid = XMLRPC.parseUid(await authRes.text());

    if (!uid) {
      return new Response(JSON.stringify({
        error: 'Odoo authentication failed — check ODOO_USER and ODOO_API_KEY',
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Find or create partner (contact)
    const partnerId = await findOrCreatePartner(ODOO_URL, ODOO_DB, uid, ODOO_API_KEY, body);

    // 3. Create calendar.event for the appointment
    const eventId = await createAppointment(ODOO_URL, ODOO_DB, uid, ODOO_API_KEY, partnerId, body);

    return new Response(JSON.stringify({
      ok: true,
      partner_id: partnerId,
      event_id: eventId,
      message: 'Booking confirmed via sovereign Odoo',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[submit-booking]', err);
    return new Response(JSON.stringify({
      error: err.message,
    }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
};

// ── XML-RPC helpers (minimal handcrafted parser; avoid heavy deps) ──
const XMLRPC = {
  serialize(method, params) {
    const esc = (s) => String(s).replace(/[<>&"']/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
    }[c]));
    const paramXml = params.map(p => `<param>${valueToXml(p)}</param>`).join('');
    return `<?xml version="1.0"?>
      <methodCall>
        <methodName>${esc(method)}</methodName>
        ${paramXml}
      </methodCall>`;
  },
  parseUid(xml) {
    const m = xml.match(/<int[^>]*>(\d+)<\/int>/);
    return m ? parseInt(m[1], 10) : null;
  },
  parseIntArray(xml) {
    const matches = [...xml.matchAll(/<int[^>]*>(\d+)<\/int>/g)];
    return matches.map(m => parseInt(m[1], 10));
  },
};

function valueToXml(value) {
  if (value === null || value === undefined) return '<value><nil/></value>';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return `<value><int>${value}</int></value>`;
    return `<value><double>${value}</double></value>`;
  }
  if (typeof value === 'boolean') return `<value><boolean>${value ? 1 : 0}</boolean></value>`;
  if (Array.isArray(value)) {
    return `<value><array><data>${value.map(v => `<value>${valueToXml(v)}</value>`).join('')}</data></array></value>`;
  }
  if (typeof value === 'object') {
    const members = Object.entries(value)
      .map(([k, v]) => `<member><name>${k}</name><value>${valueToXml(v)}</value></member>`)
      .join('');
    return `<value><struct>${members}</struct></value>`;
  }
  return `<value><string>${String(value).replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]))}</string></value>`;
}

async function callOdooObject(url, db, uid, password, model, method, args, kwargs = {}) {
  const body = XMLRPC.serialize('execute_kw', [db, uid, password, model, method, args, kwargs]);
  const res = await fetch(`${url}/xmlrpc/2/object`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body,
  });
  if (!res.ok) throw new Error(`Odoo execute_kw HTTP ${res.status}`);
  return res.text();
}

async function findOrCreatePartner(url, db, uid, password, body) {
  // Search by email
  const searchXml = await callOdooObject(
    url, db, uid, password,
    'res.partner', 'search',
    [[['email', '=', body.email]]]
  );
  const existing = XMLRPC.parseIntArray(searchXml);

  if (existing.length > 0) return existing[0];

  // Create
  const createXml = await callOdooObject(
    url, db, uid, password,
    'res.partner', 'create',
    [{
      name: body.name,
      email: body.email,
      phone: body.phone || false,
    }]
  );
  return XMLRPC.parseIntArray(createXml)[0];
}

async function createAppointment(url, db, uid, password, partnerId, body) {
  const createXml = await callOdooObject(
    url, db, uid, password,
    'calendar.event', 'create',
    [{
      name: `${body.name} — ${body.topic || 'Consultation'}`,
      partner_ids: [[6, 0, [partnerId]]],
      start: body.datetime,
      stop: addHour(body.datetime),
      appointment_type_id: body.appointment_type_id,
      description: body.notes || '',
    }]
  );
  return XMLRPC.parseIntArray(createXml)[0];
}

function addHour(datetime) {
  const d = new Date(datetime.replace(' ', 'T') + 'Z');
  d.setUTCHours(d.getUTCHours() + 1);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export const config = { path: '/.netlify/functions/submit-booking' };