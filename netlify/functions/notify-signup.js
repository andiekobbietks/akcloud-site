// netlify/functions/notify-signup.js
// ──────────────────────────────────────────────────────────────
// Receives form submissions from Netlify Forms and:
//   1. Logs the entry
//   2. Optionally sends an email via Resend
//   3. Optionally posts to a Slack/Discord webhook
//
// Wire it up in Netlify dashboard:
//   Site settings → Forms → Form notifications → Add notification → Webhook
//   URL: https://akcloud.netlify.app/.netlify/functions/notify-signup
//
// Environment variables (set in Netlify UI):
//   RESEND_API_KEY   — for email notifications (optional)
//   NOTIFY_EMAIL     — destination email
//   SLACK_WEBHOOK    — Slack/Discord incoming webhook URL (optional)
//   SITE_NAME        — branding for messages (default: AKcloud)

export default async (request) => {
  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Netlify Forms wraps form data in { data: 'form=<urlencoded>', ... }
  // For the webhook, payload.data is a URL-encoded string.
  const params = new URLSearchParams(payload.data || '');
  const formName = params.get('form-name') || params.get('form_name') || 'unknown';
  const email = params.get('email') || '(no email)';
  const company = params.get('company') || '';
  const topic = params.get('topic') || '';
  const source = params.get('source') || '';

  const siteName = process.env.SITE_NAME || 'AKcloud';

  const summary = {
    received_at: new Date().toISOString(),
    form: formName,
    email,
    company,
    topic,
    source,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown',
  };

  // ── 1. Log to function output (visible in Netlify dashboard) ──
  console.log(`[${siteName} notify-signup]`, JSON.stringify(summary));

  // ── 2. Email notification via Resend (optional) ──
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${siteName} <noreply@${siteName.toLowerCase()}.example.com>`,
          to: [process.env.NOTIFY_EMAIL],
          subject: `[${siteName}] New ${formName} signup: ${email}`,
          html: `
            <h2>New ${formName}</h2>
            <table style="border-collapse:collapse;">
              <tr><td><b>Email</b></td><td style="padding-left:12px;">${email}</td></tr>
              ${company ? `<tr><td><b>Company</b></td><td style="padding-left:12px;">${company}</td></tr>` : ''}
              ${topic   ? `<tr><td><b>Topic</b></td><td style="padding-left:12px;">${topic}</td></tr>` : ''}
              ${source  ? `<tr><td><b>Source</b></td><td style="padding-left:12px;">${source}</td></tr>` : ''}
              <tr><td><b>Time</b></td><td style="padding-left:12px;">${summary.received_at}</td></tr>
              <tr><td><b>IP</b></td><td style="padding-left:12px;">${summary.ip}</td></tr>
            </table>
          `,
        }),
      });
      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.warn(`[notify-signup] Resend rejected: ${resendRes.status} ${errText}`);
      } else {
        console.log(`[notify-signup] Email sent to ${process.env.NOTIFY_EMAIL}`);
      }
    } catch (err) {
      console.warn('[notify-signup] Resend error:', err.message);
    }
  }

  // ── 3. Slack / Discord webhook (optional) ──
  if (process.env.SLACK_WEBHOOK) {
    try {
      await fetch(process.env.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `:incoming_envelope: New ${siteName} ${formName}\n*${email}*${company ? ` from ${company}` : ''}`,
        }),
      });
    } catch (err) {
      console.warn('[notify-signup] Slack error:', err.message);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/.netlify/functions/notify-signup' };