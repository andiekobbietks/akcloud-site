// Public booking configuration. No default Odoo tenant is assumed.
export default async () => {
  let bookingUrl = null;
  const configured = process.env.BOOKING_URL;

  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) {
        bookingUrl = parsed.toString();
      } else {
        console.error('[AKTOps] BOOKING_URL must be an HTTPS URL without embedded credentials.');
      }
    } catch {
      console.error('[AKTOps] BOOKING_URL is not a valid URL.');
    }
  }

  return new Response(JSON.stringify({
    booking_enabled: Boolean(bookingUrl),
    booking_url: bookingUrl,
    updated_at: process.env.CONFIG_UPDATED_AT || new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export const config = { path: '/.netlify/functions/get-config' };
