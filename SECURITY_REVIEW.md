# AKTOps public security review

**Review date:** 25 November 2026  
**Repository:** `andiekobbietks/akcloud-site`  
**Reviewed history:** 37 commits on `master` through `32dda53f6be1359f53a5a1f2cfc6cc4e604ea4a7`  
**Remediation branch:** `security/licensing-assurance-remediation`  
**Evidence visibility:** public summary; proprietary AK Build implementation and raw evidence remain private

## Executive summary

**Remediation branch only:** the review identified several real security design weaknesses in the legacy browser admin and booking functions. The remediation branch removes those components and reduces personal data in signup logs. **The changes are not yet merged into `master` and have not been deployed to Netlify.** Until the pull request is merged and the Netlify deployment is verified, the public production site may still serve the legacy implementation.

No hard-coded production API key, private key or cloud credential value was confirmed in the inspected high-risk source excerpts. This is **not** a clean full-history secret-scan result: a dedicated automated full-history scanner has not been run in this review. If any credential was ever configured in Netlify or Odoo and may have been exposed, rotate it independently of this code change.

## Scope and method

- Enumerated the 37 commits reachable from `master` at the review SHA.
- Confirmed the history consists of the 32-commit pre-documentation chain, four Odoo documentation commits and the merge commit.
- Enumerated all 37 commit entries and reviewed their changed-file inventories and relevant diff sections.
- Read the current high-risk files in full, including `index.html`, `admin.html`, `netlify/functions/save-config.js`, `get-waitlist.js`, `submit-booking.js` and `notify-signup.js`.
- Checked repository branches and pull-request state.
- This was a manual source review. The review covered all 37 commit entries, but it was not a line-by-line legal provenance review of every asset, a penetration test, a production configuration audit or an automated secret scan of every historical blob.

The repository is public. The preserved `backup/pre-conventional-commit-history-2026-11-25` branch retains the original 32-commit chain. The Odoo documentation feature branch is also preserved.

## Findings

### SEC-01: Browser-only admin authentication was bypassable

**Severity:** High  
**Evidence:** historical `index.html` and `admin.html`

The website contained an authentication flow implemented entirely in browser JavaScript. It included a weak default credential path, stored a password hash in browser local storage, and created a session marker in `sessionStorage`. The admin page relied on the presence of that client-controlled marker rather than a server-validated authenticated session. A client-side gate is not an access-control boundary.

**Impact:** visitors could inspect and bypass the browser-side gate and reach the admin interface. The interface contained operational controls and Odoo configuration fields.

**Remediation on branch:** removed the obsolete client-side authentication/hidden admin-entry code from `index.html` and removed `admin.html`. A replacement admin console must use server-validated authentication and authorisation, secure session handling, CSRF protection and rate limiting.

### SEC-02: Odoo credentials were stored in browser local storage

**Severity:** High  
**Evidence:** historical `admin.html`

The admin UI persisted Odoo URL, database, user and API-key configuration in `localStorage`. Browser storage is accessible to same-origin JavaScript and can be exposed by XSS, malicious extensions or shared-device access. It is not suitable for privileged server credentials.

**Remediation on branch:** removed the admin page. Do not reintroduce browser-side Odoo API keys or database credentials. Store service credentials only in protected server-side secret configuration and use least-privilege accounts.

### SEC-03: Public XML-RPC booking function lacked application-level caller authentication

**Severity:** High if configured; exposure depends on deployment environment  
**Evidence:** historical `netlify/functions/submit-booking.js`

The function accepted POST requests, read Odoo credentials from environment variables and then created/located contacts and created calendar events. The incoming request did not require an authenticated caller, and the implementation did not enforce booking-specific permissions, rate limits or a safe booking lifecycle. If its Odoo environment variables were configured, an unauthenticated caller could invoke privileged server-side operations.

**Remediation on branch:** removed the legacy function. The new booking path must use Odoo server-side business logic with explicit public permissions, validation, transactional availability checks, rate limits and abuse monitoring.

### SEC-04: Administrative Netlify functions had Basic-auth-only protection

**Severity:** Medium  
**Evidence:** historical `netlify/functions/save-config.js` and `get-waitlist.js`

The functions compared a Basic Authorization header against environment-configured credentials. The reviewed code did not implement rate limiting, lockout, session lifecycle or a second factor. The browser admin page also kept credentials in local storage.

**Remediation on branch:** removed both functions with the legacy admin page. If a future admin API is needed, use a server-validated identity/session provider, scoped authorisation, CSRF protection, audit events and rate limiting. Do not recreate this Basic-auth/local-storage pattern.

### SEC-05: Signup notifications logged personal data and forwarded network metadata

**Severity:** Medium  
**Evidence:** historical `netlify/functions/notify-signup.js`

The function logged email, company, topic, source, forwarded IP and user-agent information to function logs. The forwarded IP header is not inherently trustworthy and the log collection was broader than needed for the stated notification workflow.

The function also interpolated user-submitted values into HTML email without escaping, creating an HTML injection risk in notification content.

**Remediation on branch:** logs now retain only receipt timestamp and sanitised form name; user-controlled email/company/topic/source values are escaped before HTML insertion and control characters are stripped. Review the final deployed function and retention settings after merge.

### SEC-06: Public repository history retains removed legacy code

**Severity:** Medium  
**Evidence:** public commit graph and preserved backup branch

Deleting a file from the latest branch does not remove it from earlier commits or other public branches. The old admin and XML-RPC code remains available in the repository's historical commit graph and preserved backup branch.

**Remediation:** current remediation is a forward fix, not a history rewrite. No force-push or history rewrite was performed. If an actual secret is later confirmed, revoke/rotate it first. Decide separately whether to rewrite history and coordinate the effect on clones, forks, pull requests and audit records.

### SEC-07: Repository licence and component provenance are incomplete

**Severity:** Medium (legal/compliance)  
**Evidence:** GitHub reports no repository licence; no root `LICENSE` file was observed; `support.js` references a missing source tree

The public repository has no declared repository-wide licence. The generated `support.js` bundle states it was built from `dc-runtime/src/*.ts`, but that source tree is not present. Image and screenshot ownership/provenance also needs confirmation.

**Remediation:** added [LICENSING.md](LICENSING.md) with a component register and release gates. No blanket licence has been added.

## Changes made on the remediation branch

- Removed the hidden client-side admin gate and local credential/hash/session setup from `index.html`.
- Removed `admin.html`.
- Removed `netlify/functions/get-waitlist.js`.
- Removed `netlify/functions/save-config.js`.
- Removed `netlify/functions/submit-booking.js`.
- Reduced `notify-signup.js` logs to receipt timestamp and sanitised form name.
- Escaped user-supplied values in notification HTML and stripped control characters.
- Updated the booking architecture and implementation plan to select an independently authored booking addon and exclude OCA AGPL booking code.
- Added this public review and [LICENSING.md](LICENSING.md).
- Corrected README claims and links.

## Verification still required

- [ ] Merge the remediation pull request after review.
- [ ] Confirm Netlify is configured to deploy the intended `master` branch and verify the new deployment.
- [ ] Verify `/admin.html`, `/api/get-waitlist`, `/api/save-config` and `/api/submit-booking` no longer resolve to active functions in production.
- [ ] Confirm Netlify environment variables for obsolete admin/Odoo XML-RPC functions have been removed or rotated.
- [ ] Run Gitleaks or equivalent against all refs and all reachable history, with redaction enabled.
- [ ] Review GitHub secret-scanning alerts and Netlify/Odoo audit logs where available.
- [ ] Test signup notifications with HTML-special characters and verify logs contain no unnecessary personal data.
- [ ] Confirm no deployed frontend depends on the removed functions.
- [ ] Conduct an independent security test of the replacement booking addon before launch.
- [ ] Decide whether to retain public legacy history or perform a coordinated history rewrite after secret triage.

## AK Build assurance boundary

AK Build is the private orchestration and policy layer used to structure repository intake, licensing review, security checks, approval gates and evidence generation. This public report exposes only the review scope, findings, remediation summary and remaining gates. It does not disclose proprietary workflow code, internal policy rules, orchestration prompts, private scoring logic, customer data or raw secret-scan output.

AgentSON may be used as a separate provenance/evidence format in private assurance records. No secrets or raw secret values should be written into public provenance events.

## Limitations

This report is not a certification, penetration-test attestation, legal opinion or proof that no secret exists anywhere in the repository's history or connected deployment systems. It records the evidence actually reviewed and the remediation committed on the named branch. Production status remains unverified until merge and deployment checks are complete.
