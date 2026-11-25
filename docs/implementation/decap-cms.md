# Decap CMS for AKTOps

AKTOps uses Decap CMS as a Git-backed editorial interface. The website remains a static HTML/CSS/JavaScript deployment. Decap edits content files in this repository and stores uploaded media under `assets/uploads/`. It does not introduce WordPress, a content database or an always-running application server.

## Admin route

The editorial interface is served at `/admin/` (Netlify route to `/admin/index.html`). Configuration lives in `/admin/config.yml`.

## How the pieces fit together

1. An editor opens the deployed `/admin/` page.
2. Decap authenticates the editor through the configured GitHub OAuth provider.
3. Decap reads and writes content in `andiekobbietks/akcloud-site`.
4. The editorial workflow stages drafts for review before publication.
5. Git stores the content history; Netlify deploys the static website from the production branch.
6. The public homepage fetches `/content/homepage.json`; articles are stored as Markdown under `content/insights/`.

The CMS is an editing interface, not a separate content database or backend application.

## Authentication must be configured before use

The repository config uses the Decap GitHub backend for `andiekobbietks/akcloud-site`, branch `master`, with Netlify's OAuth service. The static admin page loading successfully does **not** mean that sign-in is configured.

### Configure GitHub OAuth through Netlify

1. In GitHub, open **Settings → Developer settings → OAuth Apps** and register an OAuth App for AKTOps.
2. Use `https://akcloud.netlify.app` as its Homepage URL.
3. Set the Authorization callback URL to exactly `https://api.netlify.com/auth/done`.
4. Register the app and generate a client secret. Keep both the Client ID and Client secret available for the Netlify setup.
5. In Netlify, open the AKTOps site and navigate to **Project configuration → Access & security → OAuth → Authentication providers**.
6. Install the GitHub provider and enter the OAuth Client ID and Client secret. Save/enable it.
7. Keep the secret in Netlify only. Never commit it or expose it in `admin/config.yml`, HTML, JavaScript or a public environment variable.
8. With the current direct GitHub backend, every editor needs GitHub write access to this repository. Grant it only to trusted editors.

Official instructions: [Decap GitHub backend](https://decapcms.org/docs/github-backend/) and [Decap backend configuration](https://decapcms.org/docs/backends-overview/).

If the dashboard navigation changes, find the site's Access & security / OAuth / Authentication providers settings. Do not invent a different callback URL.

## First login and acceptance test

1. Confirm the latest website deployment includes `/admin/`.
2. Open `https://akcloud.netlify.app/admin/`.
3. Sign in with a GitHub account that has repository write access.
4. Open **Website content → Homepage** and change a small, reversible piece of copy.
5. Save it as a draft and inspect the editorial branch / pull request created by Decap in GitHub.
6. Review the diff, then publish through the editorial workflow.
7. Wait for the Netlify production deploy and verify the public homepage reflects the change.
8. Create a test Insight draft and upload a small optimised image. Confirm the image is stored under `assets/uploads/`.
9. Remove the test content using a reviewed Git change if it is not wanted.

If sign-in fails, check the OAuth provider installation, callback URL, repository permissions and pop-up blocking. Never bypass authentication by putting a personal access token in browser code.

## Content currently managed

- Homepage metadata and selected hero/about copy: `content/homepage.json`
- Insights articles: `content/insights/*.md`
- Uploaded media: `assets/uploads/`

The homepage reads the JSON file at runtime and applies managed fields. Keep JSON keys aligned with `admin/config.yml` and the `data-cms` markers in `index.html`.

| Editor field | Content key | Purpose |
|---|---|---|
| Browser title | `title` | Browser/document title |
| Meta description | `description` | Search/share description |
| Hero eyebrow | `eyebrow` | Small label above the main hero copy |
| Hero tagline | `hero_tagline` | Main hero supporting message |
| About eyebrow | `about_eyebrow` | Small label in the About section |
| About heading | `about_heading` | About section heading |
| About description | `about_description` | About section copy |

Do not rename a JSON key unless you also update the Decap field definition and the corresponding homepage data binding.

## Editorial workflow

Editorial workflow is enabled. Editors can create drafts and review changes before publication. GitHub remains the source of truth and retains content history. Review the branch or pull request before publishing, especially for public claims, prices, service descriptions, image rights and personal data.

## Static hosting and local development

The main site requires no CMS server. The admin bundle is loaded from the Decap CDN. Homepage content is fetched as static JSON, so no application API is required.

For the exact PowerShell commands to clone the repository, install and sign in to Netlify CLI, link the site, run a local preview, deploy previews, publish and recover from mistakes, follow [the CLI operations runbook](./cli-operations-runbook.md).

## Production readiness checklist

- [ ] GitHub OAuth App registered with callback `https://api.netlify.com/auth/done`
- [ ] GitHub provider installed in the Netlify site
- [ ] OAuth client secret stored only in Netlify
- [ ] Repository write access restricted to trusted editors
- [ ] `/admin/` sign-in tested on the deployed HTTPS site
- [ ] Homepage content draft, review and publish tested
- [ ] Insight draft and media upload tested
- [ ] Netlify production deployment verified
- [ ] Privacy notice and content ownership guidance published

Until these checks pass, treat the admin as deployed code awaiting authentication setup, not as a fully operational CMS.
