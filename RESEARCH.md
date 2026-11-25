# AKTOps — Infrastructure Architecture Research

This document records the research and reasoning behind the initial AKTOps hosting and Odoo Community architecture. It distinguishes published third-party reference material from AKTOps decisions and proposed implementation work.

For the current product and deployment plan, see:
- [Odoo Community on OCI — architecture decision](docs/architecture/odoo-community-oci-booking.md)
- [Odoo Community on OCI — implementation plan](docs/implementation/odoo-community-oci-booking-plan.md)
- [Project README](README.md)

---

## Research purpose

AKTOps needs a maintainable, secure and affordable operational platform that can support its own service delivery and, where appropriate, smaller client environments. The question is not how to reproduce a large enterprise Odoo hosting platform. It is how to choose the smallest architecture that meets the actual workload, customer requirements and recovery expectations while preserving a credible path to scale.

The initial use case is AKTOps's own booking and operational workflow, using Odoo Community Edition hosted on Oracle Cloud Infrastructure (OCI). The public-facing website remains separately hosted; Odoo is the booking system of record.

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

- **ERP edition:** Odoo Community Edition.
- **Hosting:** OCI Ampere A1, subject to verifying available tenancy capacity.
- **Isolation:** a dedicated LXD system container for the Odoo workload.
- **Application:** one Odoo instance.
- **Database:** one PostgreSQL instance, initially colocated inside the isolated guest.
- **Booking:** OCA Resource Booking, with a proof of concept to validate its portal flow and compatibility before committing to custom public booking development.
- **Public website:** existing static website on Netlify.
- **Ingress:** HTTPS reverse proxy and controlled public DNS for a booking hostname.
- **Backups:** encrypted, off-host backups of both PostgreSQL and the Odoo filestore, with restore testing.
- **Operations:** monitoring for service health, CPU, memory, disk, certificates, backup age and mail delivery.

The previously discussed A1 tenancy capacity is up to 4 OCPU and 24 GB RAM. A proposed Odoo guest target of 2 OCPU, 8 GB RAM and 80 GB storage is a planning estimate, not a confirmed free allocation. Actual capacity must be checked against existing workloads before provisioning. A smaller 2 OCPU / 4 GB / 47 GB guest should be treated as a constrained pilot until measured.

### Why not multi-server yet?

The current use case does not establish a need for:
- Multiple Odoo application nodes.
- A clustered or managed high-availability PostgreSQL deployment.
- Redis shared session infrastructure.
- Distributed shared file storage.
- Kubernetes or a container orchestration platform solely to run Odoo.
- Multi-region failover.

Introducing these components now would add operational overhead, failure modes and cost without a demonstrated requirement. A single-node deployment is not highly available: the design must state this limitation honestly and mitigate it with off-host backups, tested restore procedures, monitoring and a documented recovery plan.

## 4. Booking architecture and module research

The intended booking foundation is Odoo Community with the Odoo Community Association (OCA) `resource_booking` addon on its matching Odoo 19.0 branch, subject to validation.

The module's documented workflow includes resource booking types, availability calendars, pending bookings, tokenised portal slot selection and booking lifecycle handling. Its documented portal journey is invitation-led: staff create a pending booking and share a token link with the requester. This must not be assumed to provide a public service catalogue with unrestricted self-service booking.

The proof of concept must establish:
1. Compatibility with the selected Odoo Community release.
2. Required OCA dependencies and pinned source revisions.
3. Logged-out visitor behaviour for the tokenised portal.
4. Resource availability and concurrent booking conflict handling.
5. Calendar event creation, cancellation and modification behaviour.
6. Email templates, public hostname and timezone correctness.
7. Accessibility and mobile usability.

If invitation-led booking does not meet the customer journey, an AKTOps-owned addon may provide a public service catalogue and slot selection. It must use supported Odoo/OCA model methods and enforce availability and permissions server-side; it must not bypass the booking lifecycle by creating raw calendar events.

**Licensing:** the OCA `resource_booking` module is published under AGPL-3. Verify the licence of every dependency and obtain appropriate advice on obligations before modifying, distributing or offering a network-accessible modified service.

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
2. **Booking UX:** Is the OCA invitation-led portal flow sufficient, or is a public self-service catalogue necessary?
3. **Recovery:** What recovery time objective (RTO) and recovery point objective (RPO) are appropriate for the booking service, and can the proposed backup schedule meet them?
4. **Isolation:** Is a dedicated LXD guest sufficient for the current risk profile, and what host-level controls and update process are required?
5. **Data protection:** What personal data is genuinely required for a booking, how long should it be retained, and how can deletion requests be fulfilled?
6. **Commercial fit:** Which AKTOps ICPs would actually use this platform, and which workflows should remain separate rather than turning Odoo into an oversized all-purpose system?
7. **Scale-out threshold:** What measured workload or contractual availability requirement would justify a separate database, multiple application nodes or managed database service?

## 8. Limitations

- The ICP list is a working hypothesis, not validated market research.
- The proposed OCI sizing has not been load-tested.
- The OCA booking workflow must be proven against the exact Odoo/OCA revisions selected.
- A single-host architecture does not provide high availability.
- No production OCI deployment, DNS migration or live booking integration is claimed by this research document.
- ERP Magic's published architecture is a vendor-authored reference; its stated user ranges are not independent performance benchmarks.

## References

1. **ERP Magic, “The Blueprint”** — [https://www.erpmagic.com/the-blueprint](https://www.erpmagic.com/the-blueprint). Source for the vendor's published single-server and multi-server Odoo hosting patterns.
2. **OCA Calendar repository** — [https://github.com/OCA/calendar](https://github.com/OCA/calendar). Source repository for Community Odoo calendar/resource booking addons; pin and inspect the exact release branch and commit used.
3. **OCA Web repository** — [https://github.com/OCA/web](https://github.com/OCA/web). Source repository for web-related OCA dependencies; validate the matching release branch.
4. **Odoo documentation** — [https://www.odoo.com/documentation/](https://www.odoo.com/documentation/). Consult the documentation matching the deployed Community version for production deployment and operations.

---

*Research status: initial architecture research. Update this document when the Odoo/OCA proof of concept, OCI capacity assessment, workload tests or customer discovery produces evidence that changes the decisions above.*
