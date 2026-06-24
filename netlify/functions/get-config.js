// netlify/functions/get-config.js
// Returns site-wide config (booking URL, etc.) for all visitors.

export default async () => {
  const config = {
    booking_url: process.env.BOOKING_URL || 'https://andiekobbie.odoo.com/appointment/discovery-consultation-more-1',
    updated_at: process.env.CONFIG_UPDATED_AT || new Date().toISOString(),
  };

  return new Response(JSON.stringify(config, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const config = { path: '/.netlify/functions/get-config' };
