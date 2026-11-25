# AKTOps visual assurance CI/CD

## Purpose

The website's visual identity and interactions are product behaviour. This pipeline captures the rendered interface, checks core user journeys, audits accessibility and records visual evidence on every pull request and production-branch update.

It intentionally keeps the production website architecture unchanged: vanilla HTML/CSS/JS, Netlify static hosting, Netlify Forms/Functions and Decap CMS.

## Workflows

### 1. UI quality and visual evidence

File: `.github/workflows/ui-quality.yml`

Runs on pull requests targeting `master`, pushes to `master` and manual dispatch.

Stages:
1. Install the pinned Node development dependencies.
2. Run the existing Node test suite.
3. Install Chromium through Playwright.
4. Run browser interaction, responsive, design-token and axe-core accessibility checks.
5. Capture screenshot evidence, traces, videos on failure, JUnit output and an HTML report.
6. Upload evidence as a 30-day GitHub Actions artifact, even when a test fails.

### 2. Public deployment smoke test

File: `.github/workflows/post-deploy-smoke.yml`

Runs after a push to `master`, with a short deployment-readiness poll, or manually against a supplied URL. It checks the deployed page, selected security headers, the consultation modal and a real 404 response, then captures public-site screenshots.

The current default URL is the legacy Netlify hostname `https://akcloud.netlify.app`. Change the workflow-dispatch input/default when the canonical AKTOps domain is ready.

This is a post-deployment verification workflow, not a Netlify deploy command. Netlify's existing Git integration remains responsible for publishing the static site. No Netlify token or site ID is required in GitHub.

## Current automated coverage

| Surface / pattern | Checks and captures |
|---|---|
| Landing page | Page title, hero, core sections, footer, assets, runtime errors, full-page and viewport screenshots |
| Navigation | Anchor targets and visible navigation |
| Responsive layout | 320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440 and 1920px widths |
| Splash | Reduced-motion immediate dismissal and normal timed dismissal |
| Typography and palette | Rendered canvas, fonts, signal green, card surfaces and borders |
| Diffusion / depth | Navigation backdrop blur, booking overlay blur, primary glow and tooltip surface |
| Cards | Geometry, padding, hover border/glow/lift |
| Glossary | Desktop hover, click-to-pin, touch tap and dismissal |
| Onboarding | Modal opening, focus, required fields, successful submission state, Escape and backdrop close |
| Decap CMS | Admin route and readable fallback when the external editor script is unavailable |
| 404 | HTTP 404 response, chromatic split colours/blend mode and return link |
| Accessibility | axe-core WCAG 2 A/AA and WCAG 2.1 A/AA scans on homepage and modal |
| Public deployment | Availability, selected security headers, homepage, onboarding modal and 404 |

## Screenshot evidence

The visual-capture suite attaches named screenshots to the Playwright report and stores them in the workflow artifact. Captures include desktop full page, desktop viewport, card hover, glossary tooltip, onboarding modal, CMS fallback, 404, mobile full page and mobile onboarding.

The pipeline currently creates reviewable visual evidence on each run. It does **not** claim pixel-perfect baseline comparison yet: a baseline needs to be captured from an approved, current AKTOps deployment and reviewed before it becomes the comparison reference. This avoids treating the historical AKCloud screenshots as valid AKTOps baselines.

Recommended baseline process:
1. Run the workflow against an approved production deployment.
2. Download and inspect the screenshot artifact at desktop and mobile sizes.
3. Confirm fonts, assets, content and dynamic regions are stable.
4. Commit approved Playwright snapshots under `tests/ui/__screenshots__/` in a separate reviewed change.
5. Enable `toHaveScreenshot` comparisons for the approved states. Update baselines only with intentional design changes.

## Local use

```bash
npm install
npx playwright install chromium
npm test
npm run test:ui
npm run test:visual
npm run test:a11y
```

For a headed local browser:

```bash
npm run test:ui:headed
```

To run only against a deployed site:

```bash
BASE_URL=https://your-domain.example npx playwright test tests/ui/public-smoke.spec.js --project=chromium-desktop
```

On PowerShell:

```powershell
$env:BASE_URL = "https://your-domain.example"
npx playwright test tests/ui/public-smoke.spec.js --project=chromium-desktop
```

## Accessibility gate policy

Critical axe-core violations fail the initial gate. All violations, including serious, moderate and minor findings, are attached as JSON to the run so they can be triaged. This is a staged baseline: promote serious violations to blocking after reviewing and remediating the current page's existing contrast and semantic issues. Do not hide violations with broad exclusions.

## Security and deployment boundaries

- No production secrets are required by the CI workflow.
- Do not put Odoo credentials, booking API keys or private customer information into screenshots or test fixtures.
- The test server returns a non-configured booking URL and accepts test form posts locally; it never contacts Odoo or sends real notifications.
- The public smoke workflow uses read-only HTTP requests against the deployed site.
- Netlify remains the deployment authority. GitHub Actions does not deploy or mutate production.
- A successful CI run proves only the checks listed above; it does not prove Netlify environment variables, OAuth permissions, external CMS login or Odoo availability.

## Known limitations and next increments

- Visual screenshots are captured and retained, but approved pixel baselines are not committed yet.
- Chromium is the first browser engine. Add Firefox and WebKit after Chromium stabilises.
- Accessibility currently blocks critical issues while collecting the full WCAG finding set for triage.
- The Decap editor is tested through its fallback route; a real OAuth session is not automated.
- Odoo is deliberately outside this static-site test harness. Test its public booking journey only after the Odoo Community 19 service is provisioned and `BOOKING_URL` is configured.
- Browser screenshots cannot measure source raster assets' original pixel values. Keep the separate pixel-sampling protocol for source images.
