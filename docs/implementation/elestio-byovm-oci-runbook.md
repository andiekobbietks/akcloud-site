# Elestio BYOVM + OCI: Odoo Community 19 deployment runbook

**Status:** implementation runbook; provisioning not yet executed  
**Target:** Odoo Community Edition 19 on an OCI Linux VM, managed through Elestio BYOVM  
**Application owner:** AKTOps  
**Website:** Netlify static frontend  
**Booking:** independently authored AKTOps Odoo addon; no OCA AGPL booking implementation

## 1. The selected model

Elestio BYOVM is a management layer for a VM that AKTOps owns in its own cloud account. OCI remains the infrastructure provider and bills the compute, boot volume, network and any other OCI resources. Elestio connects to that VM and provides the managed-service tooling described in its BYOVM offering.

This is **not** an Elestio-hosted VM paid for through a standard Elestio cloud-provider plan, and it is **not** a direct unmanaged Odoo installation. The intended flow is:

```
Customer
  |
  v
AKTOps website (Netlify)
  | HTTPS booking link
  v
Odoo Community 19 (Elestio-managed BYOVM service)
  | runs on
  v
OCI Compute VM (AKTOps OCI tenancy)
  | private application/database network
  +--> PostgreSQL
  +--> Odoo filestore
  +--> independently authored AKTOps booking addon
```

Elestio's Odoo product has a published installation guide and says customers can choose their own server. Elestio's BYOVM documentation explicitly supports Oracle Cloud Infrastructure and other cloud providers. Confirm the Odoo 19 Community template and BYOVM target are selectable together in the live dashboard before creating the service; the public docs establish the two capabilities but do not prove every template/version/architecture combination is currently enabled in the account.

## 2. Important OCI A1 / BYOVM eligibility check

Elestio currently documents its first BYOVM service as free only when the connected VM is no larger than **2 vCPU, 4 GB RAM and 80 GB storage**. Its documentation lists a BYOVM price formula for larger VMs: $5 per vCPU + $2.50 per GB RAM + $0.25 per 10 GB disk. Confirm the live calculator, billable CPU interpretation and current terms before connecting a larger VM.

The previously discussed OCI Ampere A1 capacity of up to 4 OCPU and 24 GB RAM is **above the documented free BYOVM limits** if provisioned at that size. Do not assume it qualifies for the free BYOVM tier. OCI Ampere OCPU-to-vCPU accounting and Elestio's billable vCPU definition must be confirmed with Elestio; do not calculate a final bill from OCPU alone.

Decision options:

| Option | Elestio BYOVM status | AKTOps implication |
|---|---|---|
| OCI VM up to 2 vCPU / 4 GB / 80 GB | Within published free-tier ceiling, subject to dashboard eligibility | Lowest-cost pilot, but memory/storage may constrain Odoo |
| Existing/larger OCI A1 VM (e.g. 4 OCPU / 24 GB) | Exceeds free-tier ceiling; paid BYOVM terms apply | More headroom; confirm ARM64/template compatibility and price |
| Separate smaller OCI VM dedicated to Odoo | May fit free BYOVM ceiling if exact shape and disk comply | Cleaner isolation, but OCI infrastructure still has its own cost/eligibility |
| Elestio-provided cloud VM | Not BYOVM | Alternative only if OCI ownership is not a requirement |

**Recommended first step:** do not resize or create anything yet. Confirm in the Elestio dashboard whether the Odoo Community 19 template can deploy to BYOVM on ARM64 OCI, and confirm the cost for the exact VM shape. If the current A1 is intended, ask Elestio to confirm support for the architecture and how it counts OCI Ampere OCPU.

## 3. Prerequisites

- OCI tenancy access with permission to create or use a Compute VM, VCN, subnet, public IP and security rules.
- A supported Ubuntu Linux image. Elestio's BYOVM guide specifies Ubuntu 20.04 or later.
- Root or sudo access during connection setup.
- Stable public IP (reserved public IP recommended).
- SSH access and outbound internet connectivity.
- Elestio account with access to the Odoo Community service template and BYOVM.
- A domain or subdomain for Odoo, for example `booking.aktops.co.uk`.
- A documented owner for OCI billing, Elestio management billing, DNS, backups and incident response.

## 4. Network and firewall design

Elestio's BYOVM guide lists these minimum inbound TCP ports:

| Port | Purpose | Exposure recommendation |
|---|---|---|
| 22/TCP | SSH | Restrict to your trusted admin IPs and Elestio's documented access requirements |
| 80/TCP | HTTP / certificate validation and redirect | Public only if required |
| 443/TCP | HTTPS application access | Public |
| 18345/TCP | Elestio File Explorer tooling | Restrict to Elestio/trusted source ranges where supported |
| 18374/TCP | Elestio VS Code tooling | Restrict to Elestio/trusted source ranges where supported |
| 18445/TCP | Elestio web terminal tooling | Restrict to Elestio/trusted source ranges where supported |
| 4242/UDP | Elestio private network | Optional; enable only if required by the selected service/network setup |

Do **not** use the documentation's broad "all TCP ports" alternative as the default production rule. Start with the minimum ports, restrict administrative ports by source where Elestio supports it, and confirm the exact current source ranges/requirements with Elestio. PostgreSQL (normally 5432) must not be exposed publicly. Odoo's application port (commonly 8069) should sit behind the managed reverse proxy and must not be opened directly to the internet unless Elestio's template explicitly requires a controlled internal path.

## 5. Provisioning sequence

### Stage A — confirm the target before OCI changes

1. In Elestio, open the Odoo ERP & CRM service template.
2. Confirm the available Odoo major version is 19 and the edition is Community.
3. Confirm the service creation flow offers BYOVM / an existing BYOVM target for this template.
4. Confirm the template supports OCI Ampere ARM64 if using the existing A1 instance.
5. Ask Elestio to confirm the current BYOVM pricing for the exact OCI shape and the definition of billable vCPU.
6. Record the selected template version, architecture, pricing and support response in the deployment evidence.

**Stop condition:** if Odoo 19 Community cannot be deployed to the BYOVM target or ARM64 compatibility is not confirmed, do not proceed on the production VM. Request clarification or use a supported x86_64 OCI shape / another supported Elestio target.

### Stage B — prepare OCI VM

1. Use a dedicated Ubuntu 22.04 LTS or 24.04 LTS VM if supported by the selected Elestio template (the BYOVM general guide requires Ubuntu 20.04+).
2. Select the smallest shape that meets the confirmed template requirements and measured Odoo workload. Do not assume the free BYOVM limit is enough for production.
3. Attach a stable public IP.
4. Configure OCI network security lists/NSGs and host firewall using the minimum rules above.
5. Apply OS updates, create a named administrator account, and verify SSH key access.
6. Confirm NTP/time sync, DNS resolution and outbound HTTPS.
7. Record VM shape, architecture, OS image, boot volume size, region, public IP allocation type and firewall rules. Do not put private keys or passwords in Git.

### Stage C — connect the VM to Elestio

1. In the Elestio dashboard, select BYOVM as the provider.
2. Enter the provider label, region label and public IP as requested by the UI.
3. Follow the current Elestio-generated SSH-key instructions exactly. Do not copy a deployment key from an old guide if the dashboard supplies a different one.
4. Add the temporary Elestio deployment key using the documented method and permissions.
5. Use **Test my VM** before creating the service.
6. Review the pricing/eligibility screen. Confirm the first-service free-tier eligibility or the paid charge before approval.
7. Create the BYOVM target/service only after all checks pass.
8. Verify the temporary deployment key is removed when Elestio says setup is complete; review authorized_keys and Elestio access records.

### Stage D — deploy Odoo

1. Select the Odoo ERP & CRM template and Community edition.
2. Pin Odoo major/minor version and record the image/template identifier.
3. Deploy to the verified BYOVM target.
4. Confirm Odoo and PostgreSQL health, persistent filestore location, backup configuration and TLS.
5. Create a non-default administrator account and enable MFA wherever supported.
6. Restrict database manager and administrative interfaces.
7. Verify PostgreSQL is private and not exposed to the public internet.
8. Configure outbound email using a dedicated transactional provider and domain authentication (SPF, DKIM, DMARC).
9. Create a least-privilege integration user only when the AKTOps addon/API design is ready.

### Stage E — AKTOps booking integration

1. Develop the AKTOps booking addon independently from requirements; do not copy OCA AGPL booking code.
2. Use Odoo server-side models and access controls for availability, booking creation, rescheduling and cancellation.
3. Enforce availability conflicts transactionally on the server.
4. Expose only the intended public booking journey. Keep admin and staff workflows authenticated.
5. Keep credentials in server-side secret storage; never expose Odoo API keys in browser JavaScript, localStorage, public config or Git.
6. Configure the website's booking link only after the Odoo service and addon pass acceptance tests.
7. Use a stable hostname and HTTPS. Keep the database and internal service ports private.

## 6. Backup, recovery and operations

Elestio advertises managed backups, monitoring/alerts, OS updates, software updates and security management for BYOVM. Confirm exact retention, backup location, encryption, restore process, maintenance windows and exclusions for the selected Odoo template. Do not assume that an Elestio backup alone satisfies AKTOps's recovery needs.

Minimum AKTOps controls:

- Independent encrypted backup of PostgreSQL and Odoo filestore to storage outside the VM.
- A backup schedule aligned with the agreed RPO.
- Documented restore procedure and periodic restore test.
- Monitoring for VM health, disk space, memory pressure, Odoo workers, PostgreSQL, TLS expiry and backup age.
- Patch windows and rollback procedure for Odoo/addon updates.
- Named incident owner and documented Elestio/OCI support escalation paths.

A single VM is a single failure domain. Managed monitoring and backups do not make the service highly available.

## 7. Acceptance checklist

- [ ] Elestio confirms Odoo Community 19 template availability on BYOVM.
- [ ] Elestio confirms OCI Ampere ARM64 compatibility, if using A1.
- [ ] Exact BYOVM pricing and free-tier eligibility confirmed in dashboard.
- [ ] OCI VM provisioned with stable IP and supported Ubuntu release.
- [ ] OCI NSG/security list and host firewall reviewed; no broad all-TCP exposure.
- [ ] BYOVM connectivity test succeeds.
- [ ] Odoo 19 Community deployment succeeds on the intended target.
- [ ] TLS works and PostgreSQL is not public.
- [ ] Backups include database and filestore; restore test passes.
- [ ] Admin account, staff roles and service credentials are least-privilege.
- [ ] AKTOps booking addon passes functional, accessibility, security and concurrency tests.
- [ ] Website booking link is changed only after production acceptance.
- [ ] Monitoring, patching, incident and rollback ownership are documented.

## 8. What this runbook does not do

This document does not provision OCI infrastructure, create an Elestio service, accept paid BYOVM terms, change DNS, configure credentials or deploy Odoo. Those actions require access to your OCI and Elestio accounts and explicit review of the current dashboard settings. No credentials should be pasted into this repository or chat.

## Official references

- [Elestio BYOVM documentation](https://docs.elest.io/platform/cloud-providers/byovm/)
- [Elestio Odoo installation guide](https://elest.io/open-source/odoo/resources/installation-guide)
- [Elestio Odoo managed-service features](https://elest.io/open-source/odoo/resources/managed-service-features)
- [Elestio services and deployment FAQ](https://docs.elest.io/frequently-asked-questions/services-faq/)
- [Odoo 19 licensing](https://www.odoo.com/documentation/19.0/legal/licenses.html)
