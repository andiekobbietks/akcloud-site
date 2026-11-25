# AKTOps — Infrastructure Architecture Research

This document records the research and reasoning behind the initial AKTOps hosting and Odoo Community architecture. It distinguishes published third-party reference material from AKTOps decisions and proposed implementation work.

For the current product and deployment plan, see:
- [Odoo Community on OCI — architecture decision](docs/architecture/odoo-community-oci-booking.md)
- [Odoo Community via Elestio BYOVM — implementation plan](docs/implementation/odoo-community-oci-booking-plan.md)
- [Elestio BYOVM + OCI provisioning runbook](docs/implementation/elestio-byovm-oci-runbook.md)
- [Project README](README.md)

---

## Research purpose

AKTOps needs a maintainable, secure and affordable operational platform that can support its own service delivery and, where appropriate, smaller client environments. The question is not how to reproduce a large enterprise Odoo hosting platform. It is how to choose the smallest architecture that meets the actual workload, customer requirements and recovery expectations while preserving a credible path to scale.

The initial use case is AKTOps's own booking and operational workflow, using Odoo Community Edition 19 managed through Elestio BYOVM on an OCI VM owned by AKTOps. The public-facing website remains separately hosted; Odoo is the booking system of record.

## 1. Customer and workload context

The current AKTOps market hypothesis includes these customer groups:

| Provisional ICP | Likely operational needs | Implication for initial platform |
|---|---|---|
| Micro-businesses and sole traders | Basic IT support, booking, websites, email and automation | Low operational complexity; simple service workflows |
| Small businesses / SMEs | Managed IT, cloud, security, support and business-process automation | Reliable core services, backups and access control |
| Charities and non-profits | Affordable digital infrastructure, support, governance-conscious systems | Cost discipline, data minimisation and recoverability |
| Education and training providers | IT support, learning technology and digital enablement | Clear scheduling, service records and dependable communications |
| Start-ups and small product teams | Cloud infrastructure, DevSecOps, deployment and AI implementation | Flexible project/service workflows and integration potential |
| Growing organisations needing specialist capacity | Infrastructure improvement, security engineering and fractional technical leadership | Ability to expand or separate workloads when justified |

These are working ICP hypotheses drawn from AKTOps's intended service portfolio, not a validated market-sizing study or a final prioritised sales segmentation. They should be refined through customer interviews, actual service demand and willingness-to-pay evidence.

**Initial workload assumption:** low-volume internal booking and service operations, with a modest number of staff users and customer-facing booking requests. This assumption must be measured; it is not a forecast or a performance guarantee.

## 2. External reference: ERP Magic's published blueprint

**Primary reference:** [ERP Magic — The Blueprint](https://www.erpmagic.com/the-blueprint)

ERP Magic describes two broad Odoo hosting patterns:

### Single-server architecture

ERP Magic says it recommends a single NVMe server hosting both the Odoo application and database for customers with approximately 10–50 users. Its published description also mentions hourly backups to Amazon S3, a pfSense cloud firewall and Cloudflare for proxy, caching and web application firewall services.

### Multi-server architecture

For larger deployments, described as approximately 50–1,000+ users, ERP Magic outlines an AWS architecture using:
- A three-node Amazon Aurora PostgreSQL cluster distributed across availability zones.
- At least three Odoo application servers.
- Redis for shared session caching.
- Amazon EFS for shared file storage.

These are ERP Magic's published recommendations and service design, not independently benchmarked universal thresholds. The number of users alone does not determine capacity: concurrency, installed modules, scheduled jobs, integrations, database size, file workload, latency requirements and recovery objectives all matter.

### What AKTOps takes from this reference

The useful lesson is to match deployment complexity to workload and availability requirements. A single application/database host can be a reasonable starting pattern for a small deployment, provided that it is secured, monitored, backed up off-host and supported by a tested recovery process.

AKTOps does **not** need to reproduce ERP Magic's AWS/Aurora/Redis/EFS multi-server topology for its initial internal booking use case.

The ERP Magic page is an architectural reference only. This repository does not copy its diagrams, screenshots, branding, implementation scripts or proprietary materials. AKTOps diagrams and implementation artefacts should be independently authored.

## 3. AKTOps architecture decision

### Selected initial approach

- **ERP edition:** Odoo Community Edition 19.
- **Management/provisioning:** Elestio BYOVM.
- **Infrastructure:** OCI Compute VM in the AKTOps tenancy; OCI remains the cloud provider and bills the infrastructure.
- **Isolation:** dedicated VM for the Odoo service, subject to the selected Elestio template's requirements.
- **Application:** one Odoo instance.
- **Database:** PostgreSQL, private and not internet-exposed.
- **Booking:** independently authored AKTOps Odoo addon. OCA AGPL-3 booking code is excluded from the selected product path.
- **Public website:** existing static website on Netlify.
- **Ingress:** HTTPS reverse proxy and controlled public DNS for a booking hostname.
- **Backups:** confirm Elestio's database and filestore backup coverage; maintain independent encrypted off-VM backups and restore tests.
- **Operations:** confirm Elestio monitoring, patching, update and incident responsibilities.

### BYOVM sizing and cost constraint

Elestio's published free BYOVM ceiling is one VM with no more than 2 vCPU, 4 GB RAM and 80 GB storage. The previously discussed OCI A1 capacity of up to 4 OCPU and 24 GB RAM exceeds that free-tier ceiling at full size. Elestio publishes paid pricing based on VM resources, but OCI Ampere OCPU must be mapped to Elestio's billable vCPU definition before calculating the actual cost. OCI infrastructure charges are separate.

Before provisioning, confirm that Odoo Community 19 is selectable on a BYOVM target and that the selected OCI architecture (ARM64 for Ampere A1) is supported. Do not assume the A1 configuration qualifies for free BYOVM.

### Why not multi-server yet?

The current use case does not establish a need for:
- Multiple Odoo application nodes.
- A clustered or managed high-availability PostgreSQL deployment.
- Redis shared session infrastructure.
- Distributed shared file storage.
- Kubernetes or a container orchestration platform solely to run Odoo.
- Multi-region failover.

Introducing these components now would add operational overhead, failure modes and cost without a demonstrated requirement. A single-node deployment is not highly available: the design must state this limitation honestly and mitigate it with off-host backups, tested restore procedures, monitoring and a documented recovery plan.

## 4. Booking architecture and licensing decision

The selected booking path is an independently authored AKTOps addon for Odoo Community. The product will not incorporate OCA `resource_booking` or another AGPL-3 booking implementation.

The OCA Calendar repository is marked AGPL-3.0 at repository level; OCA states that individual addon manifests can declare different licences, so every module must be checked at its exact revision. The OCA repository is therefore excluded from the selected implementation rather than assumed to be compatible with a proprietary addon.

The independent AKTOps proof of concept must validate:
1. Odoo Community release compatibility and supported extension points.
2. Booking models, service catalogue, resource availability and working hours.
3. Server-side transactional conflict prevention under concurrent requests.
4. Logged-out public booking, token expiry, cancellation and modification permissions.
5. Calendar events, email templates, timezone correctness and accessibility.
6. Exact third-party dependency versions, source provenance and licences.

The implementation must be developed from AKTOps requirements and independently authored designs. Do not copy or adapt AGPL source. Keep a clean-room provenance record and review the addon licence and its legal relationship to Odoo's LGPL-3.0 terms before distribution or commercial release.

**Licensing references:** Odoo Community Edition 19 is documented by Odoo as LGPL-3.0: https://www.odoo.com/documentation/19.0/legal/licenses.html. OCA Calendar repository licensing and per-module manifest guidance: https://github.com/OCA/calendar.

## 5. Security and operational requirements

A small deployment still needs production-minded controls:

- Expose only required HTTPS ingress; restrict administrative access.
- Keep PostgreSQL private and do not publish its port to the internet.
- Keep Odoo administrator credentials and API keys out of frontend code, localStorage, public configuration and Git.
- Use least-privilege Odoo users, roles and service accounts.
- Apply server-side validation, rate limiting, anti-abuse controls and safe error handling to public booking flows.
- Configure trusted proxy behaviour correctly.
- Patch Odoo, PostgreSQL, the operating system and addons; pin deployed revisions.
- Back up both database and filestore to storage outside the Odoo guest.
- Encrypt backups, restrict access and periodically demonstrate restoration.
- Define retention and deletion rules for customer/contact and booking data.
- Configure SPF, DKIM and DMARC for transactional email.
- Monitor capacity and failure signals; document incident response and rollback.

A single OCI guest remains a single failure domain. Backups improve recoverability but do not provide automatic high availability.

## 6. Scaling strategy

Scale in response to measured demand and service-level requirements, not by copying an enterprise diagram.

| Evidence or trigger | Proportionate response |
|---|---|
| Development and low-volume internal use | One isolated Odoo guest and PostgreSQL instance |
| Increased CPU or memory pressure | Profile workers, scheduled jobs and database queries; then increase guest resources |
| Storage growth | Expand storage, review filestore growth and backup retention |
| Sustained concurrency or slow requests | Load test and tune Odoo/PostgreSQL; assess separating the database |
| Multiple independent client environments | Evaluate separate Odoo instances and tenant/data-isolation requirements |
| Contractual high-availability requirement | Design redundancy, database failover, shared storage and tested recovery objectives |
| Multi-node application deployment justified | Add shared session/storage design and load balancing only with measured need |

No user-count threshold in the ERP Magic blueprint should be treated as an automatic scaling trigger for AKTOps.

## 7. Research questions and validation work

1. **Workload sizing:** What are the real CPU, memory, database and storage requirements for AKTOps's booking workload under representative concurrency?
2. **Booking UX:** Does the independently authored public service catalogue and slot picker meet the required customer journey?
3. **Recovery:** What recovery time objective (RTO) and recovery point objective (RPO) are appropriate for the booking service, and can the proposed backup schedule meet them?
4. **Isolation:** Is a dedicated LXD guest sufficient for the current risk profile, and what host-level controls and update process are required?
5. **Data protection:** What personal data is genuinely required for a booking, how long should it be retained, and how can deletion requests be fulfilled?
6. **Commercial fit:** Which AKTOps ICPs would actually use this platform, and which workflows should remain separate rather than turning Odoo into an oversized all-purpose system?
7. **Scale-out threshold:** What measured workload or contractual availability requirement would justify a separate database, multiple application nodes or managed database service?

## 8. Limitations

- The ICP list is a working hypothesis, not validated market research.
- The proposed OCI sizing has not been load-tested.
- The independently authored booking addon has not yet been implemented or tested.
- A single-host architecture does not provide high availability.
- No production OCI deployment, DNS migration or live booking integration is claimed by this research document.
- ERP Magic's published architecture is a vendor-authored reference; its stated user ranges are not independent performance benchmarks.

## References

1. **ERP Magic, “The Blueprint”** — [https://www.erpmagic.com/the-blueprint](https://www.erpmagic.com/the-blueprint). Source for the vendor's published single-server and multi-server Odoo hosting patterns.
2. **OCA Calendar repository** — [https://github.com/OCA/calendar](https://github.com/OCA/calendar). Consulted to confirm repository-level AGPL-3.0 licensing and the need to inspect each module manifest. OCA booking code is excluded from the selected product path.
3. **Odoo 19 licensing documentation** — [https://www.odoo.com/documentation/19.0/legal/licenses.html](https://www.odoo.com/documentation/19.0/legal/licenses.html). States Odoo 19 Community Edition is LGPL-3.0.
4. **OCA Web repository** — [https://github.com/OCA/web](https://github.com/OCA/web). Source repository for web-related OCA dependencies; validate the matching release branch.
5. **Odoo documentation** — [https://www.odoo.com/documentation/](https://www.odoo.com/documentation/). Consult the documentation matching the deployed Community version for production deployment and operations.

---

*Research status: initial architecture research. Update this document when the Odoo/OCA proof of concept, OCI capacity assessment, workload tests or customer discovery produces evidence that changes the decisions above.*
