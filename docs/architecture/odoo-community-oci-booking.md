# AKTOps booking architecture: Odoo Community on OCI

**Status:** Architecture decision for implementation  
**Decision date:** 25 November 2026  
**Repository:** `andiekobbietks/akcloud-site`  
**Deployment branch:** `master` (this document is being prepared on a documentation branch)  
**Product decision:** Odoo Community Edition, self-hosted on Oracle Cloud Infrastructure

## 1. Decision summary

AKTOps will use **Odoo Community Edition as its booking and operational system of record**, hosted on OCI. The existing Netlify site remains the public marketing and service-discovery frontend. Booking itself will be served by the AKTOps Odoo instance on a dedicated hostname such as `booking.aktops.co.uk`.

The booking implementation will use the Odoo Community Association (OCA) `resource_booking` module on its Odoo 19.0 branch, subject to a compatibility and public-user-flow proof of concept. A small AKTOps-owned Odoo addon will provide the customer-facing booking journey if the OCA portal flow does not meet the required self-service experience.

This is **not** an Odoo Enterprise Appointments implementation. Do not document or configure the Enterprise-only Appointments app as a dependency.

## 2. Current repository baseline

The current repository is a static HTML/CSS/JavaScript site deployed on Netlify, with Netlify Functions under `netlify/functions`.

Findings from the current `master` branch:

- `index.html` retrieves `/api/get-config` and opens the returned booking URL.
- `netlify/functions/get-config.js` currently falls back to an `andiekobbie.odoo.com` appointment URL.
- `config.json` and the booking fallback in `index.html` also contain the old Odoo Online URL.
- `netlify/functions/submit-booking.js` contains a hand-written XML-RPC implementation that creates a contact and a `calendar.event`, but the current frontend does not call it.
- The existing XML-RPC implementation assumes an `appointment_type_id` and `calendar.event.appointment_type_id`; that is not the OCA `resource_booking` model and must not be treated as a working Community booking integration.
- `admin.html` contains legacy Odoo configuration and local-storage handling that needs a security review before it is retained.

The README currently describes the XML-RPC proxy as ready and says the site handles real bookings. That claim must be corrected until the new end-to-end booking path has passed acceptance tests.

## 3. Target service architecture

```text
Visitor
  |
  v
AKTOps public website (Netlify)
  |  HTTPS link / call-to-action
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
  +--> Odoo 19 Community
         |
         +--> OCA resource_booking (19.0)
         |
         +--> OCA web_calendar_slot_duration dependency
         |
         +--> AKTOps booking portal addon
         |
         +--> Odoo Calendar / Contacts / Portal / Mail
```

### Hosting boundary

- Use the existing OCI Ampere A1 capacity as the compute foundation. The known tenancy design is an A1 host with up to 4 OCPU and 24 GB RAM.
- Run Odoo in its own LXD system container, separate from the Elestio BYOVM guest intended for collaboration services such as Twake/LinShare.
- Initial sizing target for the Odoo guest: **2 OCPU, 8 GB RAM and 80 GB storage**, if the host's actual available allocation permits it. Treat this as a starting target, not a guaranteed OCI quota or a final production capacity statement.
- If only the previously planned 2 OCPU / 4 GB / 47 GB guest allocation is available, use it for a low-volume pilot only and run load/memory tests before production. Do not co-locate Twake/LinShare in this guest.
- Prefer native Odoo and PostgreSQL services inside the LXD guest for the first deployment. Avoid Docker-inside-LXD unless a tested need justifies the additional nesting and security configuration.
- Pin Odoo and OCA addon revisions. Do not deploy from an unpinned moving branch in production.

### Network and DNS

- Public DNS: `booking.aktops.co.uk` -> OCI public edge address.
- HTTPS only. TLS terminates at the host reverse proxy, which forwards to Odoo over a private host/container path.
- Expose only TCP 80/443 publicly at the edge (80 only for certificate issuance/redirect if required). SSH must be restricted to the administrator's trusted source addresses or private access path.
- PostgreSQL must listen only on loopback/private container networking. Never publish TCP 5432 to the internet.
- Odoo's internal application port must not be directly exposed to the public internet; only the reverse proxy should reach it.
- Configure Odoo proxy mode and trusted proxy headers consistently with the reverse proxy.

## 4. Community booking module decision

### Base module

Use OCA `calendar/resource_booking` from branch `19.0`. Its current manifest identifies version `19.0.1.0.2`, maturity Production/Stable, and AGPL-3 licensing. It depends on:

- Odoo `calendar`
- Odoo `mail`
- Odoo `portal`
- Odoo `resource`
- OCA `web_calendar_slot_duration`

The module supports booking types, availability calendars, resource combinations, pending bookings, portal/token-based slot selection, booking lifecycle, calendar meeting creation/deletion, conflict detection and modification deadlines.

**Important product limitation:** the documented portal workflow is invitation-led: a staff member creates a pending booking and shares a tokenised link so the requester can select a slot. That is not automatically equivalent to a public catalogue where any visitor can browse services and create a booking from scratch.

### Required proof of concept

Before building the customer journey, install the pinned OCA modules in a disposable Odoo 19 Community database and verify:

1. Resource booking types and availability calendars can be configured for AKTOps services.
2. A staff-created pending booking can be completed through the portal/token link by a logged-out visitor.
3. Slot selection prevents double booking and creates the expected calendar event.
4. Email templates and links use the AKTOps hostname and correct timezone.
5. The user experience is acceptable on mobile and accessible by keyboard.

If invitation-led booking is sufficient for the first release, use the OCA portal flow directly. If AKTOps requires open self-service booking, implement an `aktops_booking_portal` addon that extends the OCA booking domain and public website flow. It must call supported Odoo model methods and enforce availability, access rights, token expiry and anti-abuse controls. Do not create raw `calendar.event` records from the browser or bypass OCA booking lifecycle logic.

### Licensing

The OCA `resource_booking` module is AGPL-3. Review the exact licence of every addon in the deployment. Keep the AKTOps addon licence decision explicit and obtain appropriate legal review before distributing a combined or modified service. AGPL obligations can be relevant when users interact with a modified network service.

## 5. Application responsibilities

| Component | Responsibility | Must not do |
|---|---|---|
| Netlify static site | Explain services, capture leads, link visitors to booking | Store Odoo credentials or create booking records directly |
| Netlify `get-config` | Return the public booking URL only | Return database names, API keys, admin credentials or internal hostnames |
| Odoo Community | Booking records, availability, contacts, calendar, staff workflow | Expose PostgreSQL or administrative routes unnecessarily |
| OCA `resource_booking` | Resource availability, booking lifecycle and conflict checks | Be bypassed by hand-written calendar-event creation |
| AKTOps Odoo addon | Brand and shape the public booking flow where required | Reimplement resource availability or trust client-supplied slot IDs |
| PostgreSQL | Persistent Odoo database | Accept public internet connections |
| OCI host reverse proxy | TLS, routing, request limits and proxy headers | Expose Odoo's internal port directly |

## 6. Repository target structure

Keep infrastructure and Odoo application code version-controlled, but do not place database backups, filestore contents, secrets or production data in Git.

Proposed repository additions:

```text
.
├── docs/
│   ├── architecture/
│   │   └── odoo-community-oci-booking.md
│   └── implementation/
│       └── odoo-community-oci-booking-plan.md
├── infrastructure/
│   └── oci/
│       ├── README.md
│       ├── lxd/
│       │   └── aktops-odoo-profile.yaml
│       ├── proxy/
│       │   └── booking.aktops.co.uk.conf
│       └── systemd/
│           └── odoo.service
├── odoo/
│   ├── addons/
│   │   └── aktops_booking_portal/
│   │       ├── __manifest__.py
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── security/
│   │       ├── static/
│   │       └── views/
│   ├── addons.lock
│   └── README.md
├── netlify/
│   └── functions/
│       └── get-config.js
└── tests/
    └── booking-acceptance/
```

The structure is a target, not a claim that these files already exist. Create infrastructure files only after checking the actual OCI host, LXD profile, reverse proxy and deployment method. Store secret values in OCI/host secret management and Netlify environment settings, never in YAML committed to Git.

## 7. Booking request and data flow

1. Visitor selects **Book a consultation** on the AKTOps website.
2. The browser obtains the public booking URL from `/api/get-config`, or uses a validated public configuration value.
3. The browser navigates to `https://booking.aktops.co.uk` (or the configured public booking route).
4. Odoo presents the available service types and permitted slots.
5. The Odoo server validates the request, checks availability and creates the booking through the OCA booking lifecycle.
6. Odoo sends confirmation and reminder emails using configured mail transport.
7. Staff manage the booking in Odoo Resource Bookings and Calendar.
8. The visitor can reschedule/cancel only through a protected portal/token flow and within the configured modification deadline.

For an invitation-only first release, step 4 is the OCA tokenised portal page reached from an invitation generated by staff. For open self-service, the AKTOps addon supplies the public service/slot selection page.

## 8. Security, privacy and operations

- No Odoo API key, database password or administrator credential may appear in frontend JavaScript, `config.json`, localStorage, Git history or public function responses.
- Remove or disable the unused XML-RPC `submit-booking.js` path after confirming no deployed client depends on it. Do not simply repoint it to the Community database.
- Public booking endpoints need server-side validation, request size limits, rate limiting, bot protection and safe error messages.
- Use least-privilege Odoo users and groups. Public visitors must not receive backend access.
- Set correct timezone handling; store timestamps consistently and display the configured business timezone.
- Configure SPF, DKIM and DMARC for the sender domain before relying on transactional booking email.
- Keep Odoo and PostgreSQL patched. Pin addon commits and test updates in staging first.
- Back up both the PostgreSQL database and Odoo filestore daily to storage outside the Odoo guest. Encrypt backups, restrict access and perform documented restore tests.
- Keep operational logs free of unnecessary personal data. Define retention and deletion rules for booking/contact records.
- Enable monitoring for disk, RAM, CPU, service health, certificate expiry, backup age and failed mail delivery.

## 9. Acceptance criteria

The booking release is not complete until all of the following pass:

- A visitor can reach the correct AKTOps booking hostname from the live website.
- A visitor can complete the intended booking journey without an Odoo backend account.
- Two concurrent attempts cannot reserve the same exclusive resource/time slot.
- Booking confirmation and cancellation/reschedule behaviour match the configured policy.
- Staff can see and manage bookings in Odoo.
- Mobile, keyboard and screen-reader checks pass for the booking journey.
- No secrets are present in the browser, repository or public responses.
- PostgreSQL and Odoo internal ports are not internet-accessible.
- Database plus filestore backup can be restored into a clean staging instance.
- The deployment and rollback steps are documented and repeatable.

## 10. Explicit exclusions for the first release

- Odoo Enterprise Appointments.
- Elestio BYOVM as the Odoo host.
- Twake/LinShare on the Odoo guest.
- Direct browser-to-Odoo database/API access.
- Hand-written XML-RPC creation of `calendar.event` as a substitute for resource booking.
- Multi-company or multi-tenant booking unless a later requirement justifies it.
- Payment collection at booking time; treat this as a separate product decision.
