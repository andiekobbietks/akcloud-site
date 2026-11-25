<p align="center">
  <img src="assets/ak-mark2@2x.png" alt="AKTOps Logo" width="120" style="background:#080808; padding:16px 24px; border-radius:12px; filter: drop-shadow(0 0 12px rgba(57,255,20,0.5));">
</p>

<h1 align="center">AKTOps</h1>

<p align="center">
  <strong>IT Operations, Cloud Infrastructure & DevSecOps: Service Website</strong><br>
  <em>Static service website with a documented path to self-hosted booking on OCI</em>
</p>

<p align="center">
  <a href="#what-i-built">What I Built</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#technical-approach">Technical Approach</a> •
  <a href="#architecture">Architecture</a> •\n  <a href="docs/architecture/odoo-community-oci-booking.md">Odoo Architecture</a> •\n  <a href="docs/implementation/odoo-community-oci-booking-plan.md">Implementation Plan</a>
</p>

---

## What I Built

A service website and client-acquisition pipeline for AKTOps, covering IT operations, cloud infrastructure and DevSecOps. This README reflects the new service identity; the existing deployment address and repository slug remain legacy identifiers pending a later migration.

| Feature | Implementation |
|---|---|
| **Animated Landing Page** | Custom CSS animations: phosphorescent circuit board aesthetic, AK zoom-in intro, typewriter effects |
| **Interactive Glossary** | Hover/tap tooltips explaining cloud terminology (MSP, sovereign, hyperscaler, etc.): accessibility-first |
| **Email Waitlist** | Netlify Forms with webhook processing → Resend email notifications → Slack/Discord alerts |
| **Appointment Booking** | Current site opens a configured external booking URL; migration to Odoo Community on OCI is planned and documented |
| **Admin Panel** | Existing admin utilities; legacy Odoo credential/configuration handling requires review before production use |
| **Security Hardened** | HSTS, CSP headers, noindex admin routes, environment-based secrets |

---

## Live Demo

**Existing deployment URL:** [akcloud.netlify.app](https://akcloud.netlify.app) (legacy AKCloud deployment hostname; domain and deployment branding will be updated separately)

---

## Screenshots

### Landing Page: Hero View
<p align="center">
  <img src="screenshots/hero.png" alt="AKTOps Landing Page" width="800" style="border-radius: 8px; border: 1px solid #242424;">
</p>

*Full landing page with nav, countdown timer, and "Coming Soon" badge. Pure HTML/CSS: no JavaScript frameworks.*

### Interactive Glossary Tooltips
<p align="center">
  <img src="screenshots/tip.png" alt="Glossary Tooltip Feature" width="800" style="border-radius: 8px; border: 1px solid #242424;">
</p>

*Hover any underlined term to see a plain-English explanation. Built for non-technical founders evaluating cloud services. Accessibility: works on touch devices, respects `prefers-reduced-motion`.*

---

## The Problem It Solves

The service needed a professional landing page that:

1. **Captures leads** without depending on third-party form services
2. **Provides a route to discovery consultations** through a separately hosted booking service
3. **Keeps client data sovereign**: not trapped in SaaS platforms
4. **Works without JavaScript frameworks** or build pipelines

**Current state:** The static site and Netlify functions are in place. The OCI-hosted Odoo Community booking service is a planned integration and is not yet represented as a live production booking system.

---

## Technical Approach

| Layer | Stack |
|---|---|
| Frontend | Vanilla HTML/CSS/JS: no build step, no frameworks |
| Hosting | Netlify (static + serverless) |
| Forms | Netlify Forms with webhook processing |
| Backend | Netlify Functions (Node.js) |
| Booking | Planned: Odoo Community on OCI with OCA Resource Booking |
| Email | Resend API via serverless functions |
| Configuration | Netlify environment variables for public configuration; Odoo credentials remain server-side |

---

## Architecture

```
Visitor
  |
  v
AKTOps website (Netlify static HTML/CSS/JS)
  |  booking link
  v
booking.aktops.co.uk
  |
  v
OCI edge / HTTPS reverse proxy
  |
  v
Dedicated LXD guest: Odoo 19 Community
  |                         |
  |                         +--> PostgreSQL (private only)
  |
  +--> OCA Resource Booking + AKTOps booking portal addon (planned)
```

The booking service is a separate OCI-hosted application. The current website booking link still points to the legacy Odoo Online URL until the new service is deployed and verified.

---

## What This Demonstrates

- **Frontend ownership**: Static AKTOps website and Netlify delivery
- **No-code to code bridge**: Started with drag-and-drop, identified limits, built custom solution
- **Architecture direction**: Odoo Community booking is planned for self-hosting on OCI
- **B2B delivery mindset**: Every decision optimized for client trust (security headers, transparent booking flow)
- **Integration boundary**: Public website remains separate from the booking system and its database

---

## Running Locally

```powershell
npm install -g netlify-cli
netlify dev
# Opens at http://localhost:8888
```

---

## Skills Used

`Netlify` · `Netlify Functions` · `Vanilla JavaScript` · `HTML/CSS` · `Odoo Community (planned)` · `OCI (planned)` · `DevSecOps` · `Client-Facing Delivery`

---

<p align="center">
  <strong>Built by Andie Kobbie</strong><br>
  <em>AI Solutions Consultant / Automation Engineer</em><br>
  <a href="https://github.com/andiekobbietks">GitHub</a>
</p>
