# AKTOps booking architecture: Odoo Community on OCI

**Status:** Architecture decision for implementation  
**Decision date:** 25 November 2026  
**Repository:** `andiekobbietks/akcloud-site`  
**Product decision:** Odoo Community Edition, self-hosted on Oracle Cloud Infrastructure  
**Booking decision:** independently authored AKTOps booking addon; no OCA AGPL booking code in the selected path

## 1. Decision summary

AKTOps will use Odoo Community Edition as its booking and operational system of record, hosted on OCI. The existing Netlify site remains the public marketing and service-discovery frontend. Booking itself will be served by the AKTOps Odoo instance on a dedicated hostname such as `booking.aktops.co.uk`.

The customer-facing booking implementation will be independently authored by AKTOps as an Odoo addon. The selected design does **not** use OCA Resource Booking or another AGPL-3 booking implementation. Odoo Community Edition 19 is published under LGPL-3.0; exact notices, versions and all transitive dependencies must be inventoried before release. The addon licence and its relationship to Odoo's LGPL code require review before commercial distribution. This document is an engineering decision, not a legal opinion.

This is **not** an Odoo Enterprise Appointments implementation. Do not configure or document Enterprise-only Appointments as a dependency.

## 2. Repository baseline and security status

The repository is a public static HTML/CSS/JavaScript site deployed on Netlify, with serverless functions under `netlify/functions`.

The historical site included:
- A browser-only admin gate with a default `admin/admin` credential path and a locally stored password hash.
- An `admin.html` page whose access check relied on a client-controlled `sessionStorage` value.
- Browser-side storage of Odoo configuration, including an API-key field, in `localStorage`.
- Netlify functions for waitlist retrieval and configuration changes protected by Basic authentication, but without a server-managed user session or rate limiting in the code reviewed.
- A public XML-RPC booking function that, if configured with Odoo credentials, could create contacts and calendar events without an application-level authentication or rate-limit control.
- Signup notifications that logged forwarded IP/user-agent data and interpolated form values into HTML email.

The security remediation branch removes the browser-only admin gate, admin page, waitlist/configuration endpoints and legacy XML-RPC booking function. It also minimises signup logs and escapes user-controlled values in notification HTML. These changes are committed on the review branch; they are **not yet deployed to Netlify**.

The public `get-config` endpoint may return a public booking URL only. It must never return internal hostnames, database identifiers, API keys or administrator credentials.

## 3. Target service architecture

```text
Visitor
  |
  v
AKTOps public website (Netlify static site)
  |  HTTPS link / public booking URL
  v
booking.aktops.co.uk
  |
  v
OCI public edge / DNS
  |
  v
Host reverse proxy (TLS termination)
  |
  v
Dedicated LXD system container: aktops-odoo
  |                         |
  |                         +--> PostgreSQL (private/local only)
  |
  +--> Odoo Community Edition
         |
         +--> independently authored AKTOps booking addon
         |
         +--> Odoo Calendar / Contacts / Portal / Mail
```

### Hosting boundary

- Use the existing OCI Ampere A1 capacity as the compute foundation, subject to checking actual free capacity.
- Run Odoo in its own LXD system container, separate from the Elestio BYOVM guest intended for collaboration services such as Twake/LinShare.
- Initial Odoo guest target: 2 OCPU, 8 GB RAM and 80 GB storage where capacity permits. This is a planning target, not a guaranteed allocation.
- If only 2 OCPU / 4 GB / 47 GB is available, limit the deployment to a low-volume pilot and benchmark before public launch.
- Prefer native Odoo and PostgreSQL services inside the LXD guest for the first deployment. Avoid unnecessary nested container complexity.
- Pin Odoo and every addon/dependency revision.

### Network and DNS

- Public DNS: `booking.aktops.co.uk` to the OCI public edge address.
- HTTPS only. TLS terminates at the host reverse proxy, which forwards to Odoo over a private host/container path.
- Expose only required public ingress. Restrict SSH to a trusted source or private access path.
- PostgreSQL must listen only on loopback/private container networking. Never publish TCP 5432 to the internet.
- Odoo's internal application port must not be directly exposed; only the reverse proxy should reach it.
- Configure Odoo proxy mode and trusted proxy headers consistently.

## 4. Independently authored booking implementation

The addon will provide the public service catalogue and booking lifecycle without incorporating OCA AGPL booking code.

Required capabilities:
1. Public service listing limited to explicitly published booking types.
2. Server-side availability retrieval and authoritative slot validation.
3. Transactional booking creation with conflict prevention for concurrent requests.
4. Resource calendars, working hours, time off, duration and modification deadlines.
5. Minimal validated customer fields and a documented retention policy.
6. Expiring, unguessable tokens for confirmation, cancellation and permitted changes.
7. CSRF protection, rate limiting, anti-bot controls, safe error handling and abuse monitoring.
8. Accessible responsive templates and explicit timezone display.
9. Automated tests for availability, invalid slots, duplicate submissions, concurrency, token expiry, permissions, cancellation and email output.

The implementation must use documented Odoo extension points and server-side business logic. Do not create raw calendar events from the browser or trust client-supplied resource/slot identifiers.

### Clean-room and provenance controls

- Write the implementation from AKTOps requirements and independently authored designs.
- Do not copy, translate, adapt or use AGPL booking source as a hidden reference implementation.
- Record design decisions, author/source provenance, dependencies and commit history.
- Run dependency and licence identification on the exact build inputs.
- If any third-party module is introduced, record its exact version, source, licence, notices and compatibility decision before merging.

## 5. Licensing boundary

- **Odoo Community Edition 19:** LGPL-3.0 according to the official Odoo licensing documentation.
- **OCA Resource Booking:** excluded from the selected implementation. The OCA Calendar repository is AGPL-3.0 at repository level; each module manifest must still be checked individually. No OCA AGPL booking code is to be incorporated into the selected addon.
- **AKTOps booking addon:** intended as independently authored AKTOps code. Its licence and legal relationship to Odoo must be reviewed before distribution or commercial release. Do not assume a module is automatically independent merely because it is in a separate directory.
- **AK Build:** proprietary assurance/orchestration remains outside this public repository. Public reports disclose outcomes only, not internal policy rules, orchestration code or proprietary architecture.
- **Repository itself:** no repository-wide open-source licence is asserted by this architecture document. See [LICENSING.md](../../LICENSING.md).

## 6. Application responsibilities

| Component | Responsibility | Must not do |
|---|---|---|
| Netlify static site | Explain services, capture leads, link visitors to booking | Store Odoo credentials or create booking records directly |
| Netlify `get-config` | Return the public booking URL only | Return database names, API keys, admin credentials or internal hostnames |
| Odoo Community | Booking records, availability, contacts, calendar and staff workflow | Expose PostgreSQL or administrative routes unnecessarily |
| AKTOps booking addon | Public service catalogue, slot selection and booking lifecycle | Trust client-supplied slot IDs or bypass server-side conflict checks |
| PostgreSQL | Persistent Odoo database | Accept public internet connections |
| OCI host reverse proxy | TLS, routing, request limits and proxy headers | Expose Odoo's internal port directly |

## 7. Target repository structure

This is a target structure, not a claim that the files already exist.

```text
docs/
  architecture/odoo-community-oci-booking.md
  implementation/odoo-community-oci-booking-plan.md
infrastructure/
  oci/
    lxd/
    proxy/
    systemd/
odoo/
  addons/
    aktops_booking_portal/
      __manifest__.py
      controllers/
      models/
      security/
      static/
      views/
  addons.lock
netlify/
  functions/
    get-config.js
tests/
  booking-acceptance/
```

Do not place database backups, filestore contents, secrets or production data in Git. Store secret values in an appropriate secret manager or protected deployment environment.

## 8. Booking data flow

1. Visitor selects **Book a consultation** on the AKTOps website.
2. The browser obtains the public booking URL from `/api/get-config` or a validated public configuration value.
3. The browser navigates to `https://booking.aktops.co.uk`.
4. The AKTOps addon presents published services and available slots.
5. The Odoo server validates the request, checks availability transactionally and creates the booking.
6. Odoo sends confirmation and reminder emails using the configured mail transport.
7. Staff manage bookings in Odoo.
8. Visitors can cancel or reschedule only through a protected token/portal flow and within the configured deadline.

## 9. Security, privacy and operations

- No Odoo API key, database password or administrator credential may appear in frontend JavaScript, `config.json`, localStorage, Git history or public function responses.
- Do not reintroduce the removed browser-only admin page or legacy XML-RPC booking endpoint.
- Public booking endpoints require server-side validation, request size limits, rate limiting, bot protection and safe error messages.
- Use least-privilege Odoo users and groups. Public visitors must not receive backend access.
- Store timestamps consistently and display the configured business timezone.
- Configure SPF, DKIM and DMARC for transactional email.
- Keep Odoo, PostgreSQL, the operating system and addons patched; pin deployed revisions.
- Back up both PostgreSQL and the Odoo filestore off-guest. Encrypt backups, restrict access and perform restore tests.
- Keep operational logs free of unnecessary personal data. Define retention and deletion rules for booking/contact records.
- Monitor disk, RAM, CPU, service health, certificate expiry, backup age and mail delivery.

A single OCI guest remains a single failure domain. Backups improve recoverability but do not provide automatic high availability.

## 10. Acceptance criteria

- Visitor reaches the correct AKTOps booking hostname from the live website.
- Visitor completes the intended booking journey without an Odoo backend account.
- Concurrent requests cannot reserve the same exclusive resource/time slot.
- Confirmation, cancellation and rescheduling match the configured policy.
- Staff can see and manage bookings in Odoo.
- Mobile, keyboard and screen-reader checks pass.
- No secrets are present in the browser, repository or public responses.
- PostgreSQL and internal Odoo ports are not internet-accessible.
- Database plus filestore backup restores into a clean staging instance.
- Deployment and rollback steps are documented and repeatable.
- Licence and provenance review is complete before commercial release.

## 11. Explicit exclusions

- Odoo Enterprise Appointments.
- OCA AGPL-3 Resource Booking in the selected product path.
- Elestio BYOVM as the Odoo host.
- Twake/LinShare on the Odoo guest.
- Direct browser-to-Odoo database/API access.
- Hand-written XML-RPC creation of `calendar.event` as a booking substitute.
- Multi-company or multi-tenant booking until justified.
- Payment collection at booking time until separately designed and reviewed.
