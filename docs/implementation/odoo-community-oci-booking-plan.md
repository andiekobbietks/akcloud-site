# Implementation plan: Odoo Community 19 via Elestio BYOVM on OCI

**Status:** planned; no OCI VM or Elestio service has been provisioned  
**Target:** Elestio-managed Odoo Community 19 running on AKTOps-owned OCI infrastructure  
**Architecture decision:** [Odoo Community via Elestio BYOVM](../architecture/odoo-community-oci-booking.md)  
**Provisioning runbook:** [Elestio BYOVM + OCI runbook](elestio-byovm-oci-runbook.md)

## Phase 0 — feasibility and cost confirmation

**Deliverable:** verified deployment target and cost decision.

1. Confirm Odoo Community Edition 19 is available in the Elestio catalogue.
2. Confirm the Odoo 19 template can be deployed to BYOVM / existing VM.
3. Confirm OCI Ampere A1 ARM64 support if that is the chosen VM architecture.
4. Confirm Elestio's current BYOVM free-tier ceiling: 2 vCPU, 4 GB RAM, 80 GB disk.
5. Record that the previously discussed 4 OCPU / 24 GB OCI A1 configuration exceeds that ceiling at full size.
6. Confirm how Elestio counts OCI Ampere OCPU for paid BYOVM pricing; use the live dashboard calculator rather than estimating from OCPU.
7. Compare the smaller free-tier pilot, larger paid A1 VM and any supported x86_64 OCI alternative.
8. Confirm OCI infrastructure costs separately from Elestio management charges.

**Gate:** no VM creation or paid service until template, architecture and pricing are confirmed.

## Phase 1 — OCI VM preparation

**Deliverable:** hardened, reachable VM meeting Elestio's current prerequisites.

1. Select supported Ubuntu 20.04+ image; prefer a currently supported LTS release accepted by the template.
2. Select VM shape and boot volume only after Phase 0.
3. Assign a stable public IP.
4. Configure OCI NSG/security list and host firewall using Elestio's minimum documented ports.
5. Restrict SSH and Elestio tooling ports by source where supported.
6. Do not expose PostgreSQL or open all TCP ports.
7. Update the OS, verify sudo/root access, outbound connectivity and time synchronisation.
8. Record the shape, architecture, OS, storage, region and firewall evidence without storing credentials.

**Gate:** VM passes baseline hardening and connectivity checks.

## Phase 2 — Elestio BYOVM onboarding

**Deliverable:** OCI VM connected as an Elestio BYOVM target.

1. Choose BYOVM in Elestio.
2. Enter the provider/region/IP fields required by the dashboard.
3. Use the current dashboard-provided SSH key instructions; do not rely on a stale copied key.
4. Add the temporary deployment key with correct permissions.
5. Run **Test my VM**.
6. Review exact billing and eligibility before creating the service.
7. Create the BYOVM target.
8. Verify the temporary key is removed after setup and record the service ID/target name (never secrets).

**Gate:** Elestio reports the VM connected and supported.

## Phase 3 — Odoo Community 19 deployment

**Deliverable:** healthy Odoo instance with persistent storage.

1. Select Odoo ERP & CRM template, Community edition, version 19.
2. Deploy to the verified BYOVM target.
3. Confirm Odoo, PostgreSQL and filestore persistence.
4. Configure HTTPS, hostname and trusted proxy.
5. Keep PostgreSQL private.
6. Create individual administrator/staff identities; enable MFA where available.
7. Configure transactional email and domain authentication.
8. Confirm backup scope includes both PostgreSQL and filestore.
9. Complete a restore test before production data is entered.

**Gate:** Odoo is reachable over HTTPS, administrative access is controlled and recovery is demonstrated.

## Phase 4 — independently authored booking addon

**Deliverable:** tested booking functionality without OCA AGPL booking code.

1. Create addon skeleton compatible with Odoo 19 Community.
2. Implement services, durations, resources/staff, working hours and availability.
3. Implement transactional conflict prevention and concurrency tests.
4. Implement public booking, cancellation and rescheduling with scoped tokens.
5. Implement authenticated staff management and audit events.
6. Implement timezone-safe calendar events and notification templates.
7. Add accessibility and mobile UX checks.
8. Record source provenance, dependency versions and licence metadata.
9. Review the addon licence and Odoo LGPL boundary before commercial distribution.

**Gate:** functional, security, accessibility and concurrency tests pass.

## Phase 5 — website integration

**Deliverable:** website directs customers to the verified Odoo booking journey.

1. Configure the public booking hostname.
2. Update the website CTA only after the Odoo service passes acceptance.
3. Ensure the browser receives only the public booking URL.
4. Keep all privileged Odoo credentials server-side.
5. Remove any stale Odoo Online URL after cutover.
6. Test desktop/mobile booking journey and error states.

**Gate:** end-to-end booking works without exposing admin credentials.

## Phase 6 — operational readiness

**Deliverable:** repeatable operations and recovery.

1. Confirm Elestio backup, monitoring, OS update and Odoo update scope.
2. Maintain independent encrypted off-VM backups of database and filestore.
3. Test restore and record RPO/RTO achieved.
4. Monitor CPU, memory, disk, PostgreSQL, Odoo workers, TLS and backup age.
5. Document update windows, rollback and incident escalation.
6. Review personal data minimisation, retention and deletion.
7. Complete security review and historical secret scan before launch.

## Cost and sizing note

Elestio documents one free BYOVM service for a VM no larger than 2 vCPU, 4 GB RAM and 80 GB storage. The full OCI A1 configuration previously discussed (4 OCPU / 24 GB RAM) is outside that free-tier ceiling. Paid BYOVM pricing is based on VM specifications; Elestio publishes a formula, but OCI Ampere OCPU must be mapped to Elestio's billable vCPU definition by Elestio before estimating the actual charge. OCI infrastructure charges remain separate.

## Not yet done

- No OCI VM has been provisioned by this workflow.
- No Elestio account/service has been created or connected.
- No paid BYOVM option has been accepted.
- No Odoo deployment has been installed.
- No DNS or website booking link has been changed.
- No credentials or private keys are stored in this repository.
