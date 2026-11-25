# Decap CMS for AKTOps

AKTOps uses Decap CMS as a Git-backed editorial interface. The website remains a static HTML/CSS/JavaScript deployment. Decap edits content files in this repository and stores uploaded media under assets/uploads/. It does not introduce WordPress, a content database or an always-running application server.

## Admin

The editorial interface is served at /admin/ (Netlify rewrite to /admin/index.html). Configuration lives in /admin/config.yml.

## Authentication is a deployment prerequisite

The repository config uses the Decap GitHub backend for andiekobbietks/akcloud-site, branch master, with Netlify's OAuth endpoint. Before inviting editors or treating the admin as production-ready:

1. Confirm the Netlify site is linked to this GitHub repository and production branch.
2. Configure the supported GitHub OAuth authentication flow for Decap using Netlify's OAuth service. Register the OAuth application with the callback URL specified by the provider; keep its client secret in Netlify environment/site settings only.
3. Restrict OAuth and repository write permissions to trusted editors. Never put OAuth client secrets, GitHub tokens, or private keys in admin/config.yml or browser assets.
4. Deploy, open /admin/, authenticate with an authorised GitHub account, and verify that a draft change creates the expected editorial branch/commit.
5. Verify unauthorised visitors cannot write to the repository.

The CMS is not considered authenticated merely because the static admin page loads. If the OAuth provider is not configured, sign-in will fail; do not disable authentication or expose a personal access token in the browser as a workaround.

## Content currently managed

- Homepage metadata and selected hero/about copy: content/homepage.json
- Insights articles: content/insights/*.md
- Uploaded media: assets/uploads/

The homepage reads the JSON file at runtime and applies the managed fields. Keep JSON field names aligned with admin/config.yml and the data attributes in index.html.

## Editorial workflow

Decap's editorial workflow is enabled. Editors can create drafts and review changes before publication. GitHub remains the source of truth and retains content history.

## Static hosting

The main site requires no CMS server. The admin bundle is loaded from the Decap CDN; for a fully self-hosted admin, vendor and pin the Decap bundle locally after reviewing its licence and update process. Homepage content is fetched as static JSON, so no application API is required.

## Operational checklist

- [ ] Configure GitHub OAuth provider and callback in Netlify
- [ ] Restrict editor access to trusted GitHub identities
- [ ] Test /admin/ sign-in
- [ ] Test homepage content update and publish
- [ ] Test image upload to assets/uploads/
- [ ] Test editorial draft and review workflow
- [ ] Publish privacy notice and content ownership guidance
