# AKcloud — Sovereign Cloud MSP Landing Site

A production landing page for a managed cloud services business, built end-to-end from first principles. Static-first architecture with serverless backend, real lead capture, and integrated booking system.

## What I Built

A complete client acquisition pipeline:

- **Animated landing page** with custom CSS animations (phosphorescent circuit board aesthetic, no frameworks)
- **Email waitlist** via Netlify Forms with real-time admin dashboard
- **Serverless functions** for email notifications (Resend), webhook processing, and API proxying
- **Appointment booking system** integrated with Odoo backend via XML-RPC
- **Admin panel** with live waitlist data, booking management, and Odoo configuration
- **Security hardened** — HSTS, CSP headers, noindex admin routes, environment-based secrets

## Technical Approach

| Layer | Stack |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no build step, no frameworks |
| Hosting | Netlify (static + serverless) |
| Forms | Netlify Forms with webhook processing |
| Backend | Netlify Functions (Node.js) |
| Booking | Odoo XML-RPC integration |
| Email | Resend API via serverless functions |
| Auth | Environment variables, Basic auth, OAuth2 for Odoo |

## What This Demonstrates

- **End-to-end ownership**: From first wireframe to deployed production site with real integrations
- **No-code to code bridge**: Started with drag-and-drop, identified limits, built custom solution
- **Problem-solving**: Client needed sovereign data control — built Odoo integration that keeps data in their infrastructure
- **B2B delivery mindset**: Every decision optimized for client trust (security headers, transparent booking flow)
- **Automation**: Email notifications, waitlist management, booking confirmation — all automated via serverless functions

## The Problem It Solves

A sovereign cloud MSP needed a professional landing page that:
1. Captures leads without depending on third-party form services
2. Books discovery consultations directly into their Odoo CRM
3. Keeps client data sovereign (not trapped in SaaS platforms)
4. Works without JavaScript frameworks or build pipelines

**Result**: Zero-dependency stack that deploys in 30 seconds, handles real bookings, and maintains full data sovereignty.

## Running Locally

```powershell
npm install -g netlify-cli
netlify dev
# Opens at http://localhost:8888
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│  Netlify Forms   │────▶│  Email Notify   │
│   (Static HTML) │     │  (Lead Capture)  │     │  (Resend API)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Booking Widget │────▶│ Serverless Func  │────▶│  Odoo Backend   │
│  (Vanilla JS)   │     │  (XML-RPC Proxy) │     │  (CRM + Calendar)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Skills Used

`n8n` · `Make` · `Power Automate` · `XML-RPC` · `Serverless Architecture` · `API Integration` · `Vanilla JavaScript` · `CSS Animations` · `Security Hardening` · `DevOps` · `Client-Facing Delivery`

---

*Built by Andie Kobbie — AI Solutions Consultant / Automation Engineer*
