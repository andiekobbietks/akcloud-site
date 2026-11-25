# AKTOps Odoo Community on OCI: implementation plan

**Status:** Proposed delivery plan  
**Architecture decision:** Odoo Community Edition on OCI with an independently authored AKTOps booking addon  
**Related document:** [Architecture decision](../architecture/odoo-community-oci-booking.md)

## Delivery principles

- Use Odoo Community Edition, not Enterprise Appointments.
- Keep the Netlify marketing site separate from the Odoo system of record.
- Do not incorporate OCA AGPL-3 booking code or dependencies into the selected booking implementation.
- Keep AK Build orchestration, policy rules and proprietary assurance logic private.
- Keep the existing Elestio BYOVM collaboration-services plan separate from Odoo.
- Work on reviewed feature branches; never describe planned work as delivered.

## Phase 0: baseline and design verification

**Outputs:** confirmed workload, booking UX, data model and deployment inventory.

1. Record the current Netlify site, functions and environment variable names.
2. Confirm the current booking CTA and public configuration flow.
3. Define whether bookings are open self-service, invitation-only or both.
4. Confirm the exact Odoo Community release and its LGPL-3.0 notices.
5. Inspect OCI A1 capacity, LXD configuration, public IP, DNS, reverse proxy and firewall rules.
6. Define data minimisation, retention, deletion, consent and operational ownership.
7. Confirm the repository's third-party asset provenance before applying any repository-wide licence.

**Exit gate:** architecture, data flows, capacity and licensing boundaries are approved before production changes.

## Phase 1: Odoo Community proof of concept

**Outputs:** isolated Odoo Community instance and a validated booking-domain design.

1. Provision an isolated staging guest and PostgreSQL instance.
2. Install the selected Odoo Community release from a pinned source revision.
3. Do not install OCA Resource Booking or other AGPL-3 booking modules in the selected path.
4. Define AKTOps booking models and lifecycle using documented Odoo extension points.
5. Validate availability, timezone, resource calendars, slot duration, capacity and concurrency.
6. Verify public/portal access boundaries, cancellation, rescheduling and audit history.
7. Test email delivery and accessibility on mobile and keyboard-only navigation.
8. Record each Odoo core and Python/JavaScript dependency with its exact version and licence.

**Exit gate:** the proof of concept demonstrates conflict-safe booking and access separation, with a reviewed dependency/licence inventory.

## Phase 2: OCI production foundation

**Outputs:** isolated production guest, DNS/TLS, service supervision, backups and monitoring.

1. Create the dedicated `aktops-odoo` LXD system container on the OCI Ampere A1 host.
2. Start with a target allocation of 2 OCPU, 8 GB RAM and 80 GB storage where actual capacity permits. If only 2 OCPU / 4 GB / 47 GB is available, keep the deployment at pilot scope and benchmark before public launch.
3. Configure a private container address and reverse-proxy route for `booking.aktops.co.uk`.
4. Configure HTTPS, request limits, security headers and trusted proxy settings.
5. Bind PostgreSQL to loopback/private networking only and use a non-superuser Odoo database role.
6. Configure Odoo systemd service, dedicated OS user, config-file permissions and log rotation.
7. Configure encrypted off-guest database and filestore backups, plus a tested restore procedure.
8. Add service, resource, certificate and backup monitoring.

**Exit gate:** HTTPS access works, database/internal ports are private, and a clean restore succeeds.

## Phase 3: independently authored booking implementation

**Outputs:** AKTOps-owned booking addon and tested visitor-to-staff lifecycle.

1. Create `odoo/addons/aktops_booking_portal` as an independently authored module.
2. Implement a public service catalogue containing only explicitly published services.
3. Retrieve availability server-side; never trust a client-supplied slot or resource identifier.
4. Create bookings through server-side business logic with transactional conflict checks.
5. Validate and minimise name, email, phone and enquiry fields.
6. Use expiring, unguessable tokens for confirmation and permitted booking changes.
7. Add CSRF protection, rate limiting, anti-bot controls, safe error handling and abuse monitoring.
8. Provide accessible responsive templates and explicit timezone display.
9. Add automated tests for availability, invalid slots, duplicate submissions, concurrency, token expiry, permissions, cancellation and email output.
10. Maintain a clean-room development record: requirements, independently written code, design decisions and dependency provenance. Do not copy AGPL source or adapt AGPL implementation details.

**Licensing gate:** the addon licence and its relationship to Odoo's LGPL-3.0 code must be reviewed before distribution or commercial release. No licence choice can override third-party obligations.

## Phase 4: Netlify integration and legacy cleanup

**Outputs:** the public website routes to the OCI booking service without browser-held administrative credentials.

1. Configure `netlify/functions/get-config.js` to return only the public booking URL.
2. Update the booking CTA to `https://booking.aktops.co.uk` only after the service is deployed and verified.
3. Keep Odoo API keys, database credentials and administrative secrets out of browser JavaScript, localStorage, public JSON and Git.
4. Do not reintroduce the removed client-side admin panel or unauthenticated XML-RPC booking function.
5. Keep notification logs minimal and escape user-controlled content in outbound HTML.
6. Remove stale Odoo Online URLs only after the new endpoint is live and tested.
7. Correct README claims to describe only functionality that has actually passed acceptance tests.

**Exit gate:** the live website reaches the verified booking service; no privileged credentials are present in browser storage or public responses.

## Phase 5: release hardening and launch

**Outputs:** production release, operational runbook and rollback.

1. Run functional, accessibility, mobile, security and concurrency tests.
2. Load-test representative booking traffic and record CPU, RAM and database behaviour.
3. Verify backup age, restore time and recovery point.
4. Verify mail deliverability and domain authentication.
5. Test deployment rollback to the previous Odoo/addon revision.
6. Publish an operations runbook covering staff booking management, service hours, cancellations, backups, updates and incident response.
7. Launch only after licensing review, security review and data-protection checks are signed off.

**Exit gate:** all acceptance criteria pass and rollback/restore are demonstrated.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Odoo addon is treated as automatically independent/proprietary | Review the actual code relationship and LGPL-3.0 terms with counsel |
| AGPL code is copied or introduced transitively | Exclude AGPL booking modules; scan and review every dependency |
| Booking race conditions | Transactional server-side availability checks and concurrency tests |
| Public endpoint abuse | Rate limits, CSRF, token expiry, bot controls and monitoring |
| Small guest runs out of memory or disk | Pilot first, benchmark and scale from measurements |
| Data loss | Encrypted off-guest database and filestore backups; restore drills |
| User data retained unnecessarily | Data minimisation, retention schedule and deletion procedure |

## Definition of done

- [ ] Odoo Community runs on OCI and is separate from Elestio BYOVM services.
- [ ] Odoo core notices and exact dependency licences are recorded.
- [ ] No OCA AGPL-3 booking implementation or transitive AGPL booking dependency is used.
- [ ] The AKTOps booking addon has a documented independent development/provenance record.
- [ ] The addon licence has been reviewed for compatibility with Odoo and the delivery model.
- [ ] The visitor booking journey is tested, accessible and conflict-safe.
- [ ] The AKTOps website routes to the verified booking hostname.
- [ ] No browser-side Odoo credentials or legacy XML-RPC booking path exists.
- [ ] Database and filestore backups have been restored successfully.
- [ ] Monitoring, operations and rollback documentation are complete.
