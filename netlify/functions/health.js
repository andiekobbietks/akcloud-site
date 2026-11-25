// Public health check. Exposes deployment metadata, never secrets.
export default async () => new Response(JSON.stringify({
  status: 'ok',
  site: 'AKTOps',
  deploy_id: process.env.DEPLOY_ID || 'unknown',
  deploy_context: process.env.CONTEXT || 'unknown',
  deploy_branch: process.env.BRANCH || 'unknown',
  commit_ref: process.env.COMMIT_REF || 'unknown',
  timestamp: new Date().toISOString(),
}), {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export const config = { path: '/.netlify/functions/health' };
