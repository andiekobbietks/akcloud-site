# AKTOps booking architecture: Odoo Community 19 via Elestio BYOVM on OCI

**Status:** selected deployment architecture; service not yet provisioned  
**Decision date:** 25 November 2026  
**Repository:** `andiekobbietks/akcloud-site`  
**ERP:** Odoo Community Edition 19  
**Management/provisioning:** Elestio BYOVM  
**Infrastructure:** OCI Compute VM owned in the AKTOps OCI tenancy  
**Booking:** independently authored AKTOps Odoo addon; no OCA AGPL booking implementation

## 1. Decision

AKTOps will use Elestio BYOVM to manage an Odoo Community 19 deployment running on a VM in AKTOps's own OCI tenancy, subject to Elestio confirming the selected Odoo template, OCI Ampere architecture compatibility and the actual BYOVM price.

This corrects the previous direct-self-hosting description. OCI remains the infrastructure provider and account owner; Elestio provides the BYOVM management layer. It is not accurate to say Elestio is the cloud host for this arrangement.

Elestio's published BYOVM documentation says it supports VMs from Oracle Cloud and other providers. Elestio's Odoo installation guide describes deployment on a customer's own server. Before provisioning, verify in the live dashboard that Odoo Community 19 can be deployed to the selected BYOVM target and that ARM64 is supported if using OCI Ampere A1.

## 2. Architecture

```
Customer / staff
      |
      v
AKTOps marketing website (Netlify)
      |
      | HTTPS booking link
      v
booking.aktops.co.uk
      |
      v
Elestio-managed Odoo service
      |
      | BYOVM management connection
      v
OCI Compute VM (AKTOps tenancy)
      |
      +--> Odoo Community 19
      +--> PostgreSQL (private only)
      +--> Odoo filestore (persistent)
      +--> AKTOps independently authored booking addon
```

The Netlify website remains separate from Odoo. The browser communicates with the public Odoo booking journey over HTTPS; privileged integration credentials remain server-side. PostgreSQL and internal Odoo ports must not be publicly exposed.

## 3. Important BYOVM eligibility and cost constraint

Elestio's current published BYOVM free tier allows one service when the connected VM is no larger than 2 vCPU, 4 GB RAM and 80 GB storage. The user's previously discussed OCI A1 capacity (up to 4 OCPU / 24 GB RAM) exceeds that documented free-tier ceiling at the full size.

Elestio publishes a larger-VM pricing formula of $5 per vCPU + $2.50 per GB RAM + $0.25 per 10 GB disk. However, do not calculate a definitive charge from OCI OCPU until Elestio confirms how it maps Ampere OCPU to billable vCPU and the live dashboard confirms the current terms. OCI infrastructure charges remain separate.

The practical options are:
- A smaller OCI VM within the published free-tier ceiling, if it is sufficient for the actual Odoo workload and the template supports its architecture.
- A larger OCI A1 VM with paid BYOVM management, after confirming exact cost and ARM64 support.
- Another supported OCI shape/architecture if the Odoo template requires x86_64.

Do not assume the 4 OCPU / 24 GB A1 shape is eligible for free Elestio BYOVM.

## 4. Responsibilities

| Area | Responsible party |
|---|---|
| OCI tenancy, VM lifecycle, network, public IP and infrastructure billing | AKTOps / OCI |
| BYOVM connection, Elestio management tooling and agreed managed operations | Elestio |
| Odoo service configuration, users, business data, addon acceptance and access policy | AKTOps |
| Booking addon source, licence and maintenance | AKTOps |
| Website and booking CTA | AKTOps / Netlify |
| Domain/DNS ownership | AKTOps |
| Backup/restore assurance | Shared: confirm Elestio scope; AKTOps validates independent restore |

Confirm the exact operational responsibilities, backup retention, update windows and incident support in the Elestio service terms before production use.

## 5. Booking and licensing decision

The booking functionality will be independently authored as an AKTOps Odoo addon. OCA AGPL booking modules are excluded from the selected implementation. Odoo Community Edition 19 is LGPL-3.0 according to Odoo's licensing documentation. The addon licence and legal relationship to Odoo must be reviewed against the actual source and distribution model before commercial release.

The addon must implement:
- Service catalogue and booking duration.
- Staff/resource availability and working hours.
- Server-side conflict prevention under concurrent requests.
- Public booking with minimal customer data.
- Secure cancellation and rescheduling tokens.
- Authenticated staff/admin management.
- Calendar events, timezone correctness and email notifications.
- Audit events and retention/deletion controls.

Do not use Enterprise Appointments or copy/adapt AGPL booking source.

## 6. Security baseline

- Keep PostgreSQL private; do not expose port 5432 publicly.
- Use HTTPS and a stable DNS hostname.
- Apply only Elestio's documented minimum BYOVM firewall ports; do not open all TCP ports as a default.
- Restrict SSH and Elestio management ports by source where supported.
- Do not put Odoo API keys or admin credentials in frontend code, localStorage, public config or Git.
- Use least-privilege Odoo accounts and server-side validation.
- Configure trusted proxy settings correctly.
- Enable MFA for Elestio and Odoo administrator identities where available.
- Confirm the temporary Elestio deployment key is removed after onboarding.
- Confirm backup encryption, location, retention and restore process.
- Keep Odoo, OS and addon versions pinned and patched.

## 7. Go-live gates

1. Elestio confirms Odoo 19 Community template + BYOVM target compatibility.
2. Elestio confirms OCI Ampere ARM64 support if using A1.
3. Confirm exact BYOVM billing and whether the VM qualifies for the free tier.
4. Provision OCI VM and pass Elestio's connectivity test.
5. Deploy Odoo and verify TLS, private database access and persistence.
6. Validate backup/restore for both database and filestore.
7. Implement and test the independent booking addon.
8. Perform security, accessibility and concurrency testing.
9. Update the website booking CTA only after acceptance.
10. Complete live route, environment-secret and historical secret-scan checks already recorded in `SECURITY_REVIEW.md`.

## 8. Official references

- [Elestio BYOVM](https://docs.elest.io/platform/cloud-providers/byovm/)
- [Elestio Odoo installation guide](https://elest.io/open-source/odoo/resources/installation-guide)
- [Elestio Odoo managed-service features](https://elest.io/open-source/odoo/resources/managed-service-features)
- [Elestio deployment FAQ](https://docs.elest.io/frequently-asked-questions/services-faq/)
- [Odoo 19 licensing](https://www.odoo.com/documentation/19.0/legal/licenses.html)
