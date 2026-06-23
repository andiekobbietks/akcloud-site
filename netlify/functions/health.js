// netlify/functions/health.js
// ──────────────────────────────────────────────────────────────
// Simple health check — useful for monitoring and uptime checks.
// Returns deploy info so you can verify which version is live.

export default async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    site: 'AKcloud',
    deploy_id: process.env.DEPLOY_ID || 'unknown',
    deploy_url: process.env.DEPLOY_URL || 'unknown',
    deploy_context: process.env.CONTEXT || 'unknown',
    deploy_branch: process.env.BRANCH || 'unknown',
    commit_ref: process.env.COMMIT_REF || 'unknown',
    function_version: process.env.NETLIFY_FUNCTIONS_VERSION || 'unknown',
    timestamp: new Date().toISOString(),
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/.netlify/functions/health' };