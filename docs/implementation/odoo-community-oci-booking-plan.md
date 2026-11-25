# AKTOps Odoo Community on OCI: implementation plan

**Status:** Proposed delivery plan  
**Architecture decision:** Odoo Community Edition on OCI, with OCA Resource Booking  
**Related document:** [Architecture decision](../architecture/odoo-community-oci-booking.md)

## Delivery principles

- Deliver a working, secure booking journey before adding wider ERP customisation.
- Keep the Netlify marketing frontend independent from the Odoo deployment.
- Use Odoo Community and OCA modules only; do not introduce Enterprise Appointments dependencies.
- Keep the existing Elestio BYOVM collaboration-service plan separate from Odoo.
- Make changes on a feature branch and merge through a reviewed pull request.
- Every commit must describe the actual change and its scope.

## Phase 0: baseline and design verification

**Outputs:** confirmed current site behaviour, Odoo version choice, booking UX decision, deployment inventory.

1. Record the current default branch, Netlify site settings, deployed functions and environment variable names.
2. Trace every booking call in `index.html`, `admin.html`, `config.json` and `netlify/functions/*`.
3. Decide whether the first release is invitation-led (OCA token link) or open self-service (public service catalogue and slot picker).
4. Confirm Odoo 19.0 Community and OCA `calendar` 19.0 are the selected compatible release lines.
5. Inspect the OCI A1 host's actual free CPU, memory and disk, current LXD configuration, public IP, DNS, reverse proxy and firewall rules.
6. Confirm that the proposed Odoo guest can be provisioned without starving existing services.

**Exit gate:** no production changes until the public booking experience and OCI resource allocation are agreed.

## Phase 1: Odoo Community proof of concept

**Outputs:** disposable Odoo 19 Community instance and tested OCA Resource Booking workflow.

1. Provision an isolated test guest or staging container on OCI.
2. Install Odoo 19 Community and PostgreSQL using pinned versions.
3. Check out OCA/calendar branch 19.0 and OCA/web branch 19.0 at pinned commit SHAs.
4. Install `resource_booking` and its required `web_calendar_slot_duration` dependency. Install Python dependencies declared by the OCA modules, including `cssselect` and `freezegun` where required.
5. Configure one AKTOps service, one staff resource, working hours, holidays, duration, slot interval and modification deadline.
6. Test the documented staff-created pending booking and tokenised portal flow as a logged-out visitor.
7. Verify timezone, confirmation email, calendar event creation, conflict prevention and cancellation/modification rules.

**Exit gate:** a repeatable proof of concept demonstrates that the OCA module works on the selected Odoo release. If the token flow is not sufficient for AKTOps, scope the custom public portal addon before proceeding.

## Phase 2: OCI production foundation

**Outputs:** isolated production guest, DNS/TLS, service supervision, backups and monitoring.

1. Create the dedicated `aktops-odoo` LXD system container on the OCI Ampere A1 host.
2. Start with a target allocation of 2 OCPU, 8 GB RAM and 80 GB storage where actual capacity permits. If the available allocation is only 2 OCPU / 4 GB / 47 GB, limit the release to a low-volume pilot and benchmark before opening it to the public.
3. Configure a private container address and host reverse-proxy route for `booking.aktops.co.uk`.
4. Configure HTTPS, HTTP-to-HTTPS redirect, security headers, request limits and trusted proxy settings.
5. Bind PostgreSQL to loopback/private networking only. Create a non-superuser database role for Odoo.
6. Configure Odoo systemd service, dedicated OS user, config file permissions and log rotation.
7. Configure encrypted off-guest database and filestore backups, plus a tested restore procedure.
8. Add service, resource, certificate and backup monitoring.

**Exit gate:** the Odoo login and test portal are reachable over HTTPS; no database or internal application port is publicly exposed; a backup restore succeeds.

## Phase 3: Community booking implementation

**Outputs:** configured OCA booking and, if required, AKTOps public booking addon.

1. Configure the AKTOps service catalogue and booking types.
2. Configure resource combinations, staff calendars, working hours, time off, slot duration and modification deadlines.
3. If invitation-led booking is accepted, brand the OCA portal pages and email templates without changing its core booking logic.
4. If open self-service is required, create `odoo/addons/aktops_booking_portal` with:
   - public service listing limited to explicitly published booking types;
   - server-side availability retrieval;
   - server-side booking creation through OCA-supported model methods;
   - validated name, email, phone and optional enquiry fields;
   - expiring, unguessable access tokens for confirmation and subsequent changes;
   - CSRF protection, rate limiting, anti-bot controls and safe error handling;
   - accessible responsive templates and clear timezone display.
5. Add automated tests for availability, invalid slots, duplicate submissions, concurrency conflicts, token expiry, permissions and email output.
6. Review AGPL-3 implications and addon dependency/licence metadata before publishing or distributing the deployment.

**Exit gate:** the complete visitor-to-staff booking lifecycle passes automated and manual acceptance tests.

## Phase 4: Netlify integration and legacy cleanup

**Outputs:** AKTOps website points to OCI booking; no legacy Odoo Online/XML-RPC assumptions remain.

1. Change `netlify/functions/get-config.js` to return only the public `BOOKING_URL`, with a safe production default for `https://booking.aktops.co.uk`.
2. Update the booking fallback in `index.html` and `config.json` to the new hostname, or remove duplicated fallbacks and use one canonical configuration source.
3. Ensure the booking CTA opens the Odoo-hosted public flow in a predictable new or same tab, with accessible link text and analytics that do not collect form contents.
4. Audit `admin.html`; remove Odoo API-key fields and localStorage credential storage. Admin configuration must not expose privileged Odoo credentials to a browser.
5. Retire `netlify/functions/submit-booking.js` after confirming it is unused in all deployed frontend versions. Remove its XML-RPC helper and obsolete comments rather than adapting it to the OCA model.
6. Remove stale `andiekobbie.odoo.com` defaults and Enterprise Appointments references from user-facing documentation and configuration.
7. Correct README claims so they describe only verified functionality.

**Exit gate:** live website routes to OCI Odoo; browser inspection confirms no Odoo credentials or XML-RPC calls; repository search finds no active legacy booking URL.

## Phase 5: release hardening and launch

**Outputs:** production release, operational runbook and rollback.

1. Run functional, accessibility, mobile, security and concurrency tests.
2. Run a modest load test against the expected booking traffic and record CPU/RAM/database behaviour.
3. Verify backup age, restore time and recovery point.
4. Verify mail deliverability and domain authentication.
5. Test deployment rollback to the previous Odoo/addon revision.
6. Publish operational runbook covering staff booking management, service hours, leave, cancellations, rescheduling, backups, updates and incident response.
7. Release to production and monitor booking completion, errors, resource use and mail delivery.

**Exit gate:** all architecture acceptance criteria are satisfied and the rollback/restore process is demonstrated.

## Proposed commit sequence

Use focused, descriptive commits. Suggested sequence:

1. `docs(architecture): define Odoo Community booking on OCI`
2. `docs(implementation): plan OCA resource booking rollout`
3. `infra(oci): add isolated Odoo guest and proxy configuration`
4. `odoo(addons): add pinned OCA booking dependencies`
5. `odoo(booking): add AKTOps public booking portal`
6. `test(booking): cover availability and booking lifecycle`
7. `feat(site): route booking CTA to OCI Odoo`
8. `fix(security): remove legacy browser Odoo credentials`
9. `docs(runbook): document Odoo operations and recovery`

Do not create commits for phases that have not actually been implemented. The sequence is a plan, not a record of completed work.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| OCA portal flow is invitation-led rather than open public self-service | Validate in Phase 1; build the public addon only if required |
| Small guest runs out of memory or disk | Start with conservative concurrency; monitor and benchmark; increase allocation before wider launch |
| OCA addon dependency or branch drift | Pin Odoo/OCA commit SHAs and test upgrades in staging |
| AGPL-3 obligations misunderstood | Review module licences and distribution/network-service obligations before release |
| Legacy XML-RPC code creates invalid or unsafe records | Retire it; use OCA booking lifecycle methods |
| Public endpoint abused or spammed | Rate limit, validate server-side, use CSRF/token controls and bot protection |
| Data loss | Back up database and filestore off-guest and test restores |
| Booking email goes to spam | Configure SPF, DKIM and DMARC; monitor delivery |

## Definition of done

- [ ] Odoo Community runs on OCI and is not dependent on Elestio BYOVM.
- [ ] OCA Resource Booking 19.0 is pinned and installed.
- [ ] The chosen public booking journey is documented and tested.
- [ ] The AKTOps website routes to `booking.aktops.co.uk`.
- [ ] No Enterprise Appointments dependency remains.
- [ ] No browser-side Odoo credentials or legacy XML-RPC booking path remains.
- [ ] Availability conflicts and duplicate requests are safely handled.
- [ ] Backups include PostgreSQL and filestore and have been restored successfully.
- [ ] Monitoring, operations and rollback documentation are complete.
