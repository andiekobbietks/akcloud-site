# AKTOps repository licensing and provenance report

**Review date:** 25 November 2026  
**Repository:** `andiekobbietks/akcloud-site`  
**Branch:** `security/licensing-assurance-remediation`  
**Evidence type:** manual repository and history review; not legal advice

## Executive result

**Action required:** the repository does not currently declare a repository-wide licence. GitHub reports no detected repository licence and no root `LICENSE` file was present in the reviewed tree. Do not describe the repository as MIT, Apache-2.0, open source or otherwise permissively licensed until the owner deliberately selects and adds a licence.

A public GitHub repository is not automatically an open-source grant. In the absence of an explicit licence, ordinary copyright restrictions continue to apply.

## Component register

| Component | Observed / intended licence | Status and action |
|---|---|---|
| AKTOps website HTML, CSS and JavaScript | No repository-level licence declared | Ownership and contributor provenance should be confirmed; do not add a blanket licence until the asset/source inventory is complete |
| `support.js` generated bundle | Unknown from repository evidence | Header says it is generated from `dc-runtime/src/*.ts`, but that source tree is not present in this repository. Identify origin, version, author and licence before redistribution |
| Images, logos, screenshots and attached assets | Not established by the Git history alone | Confirm original creation, commissioned-work rights and any third-party source/stock terms |
| Google Fonts (Exo 2, DM Sans, JetBrains Mono) | External web-font resources; likely upstream font licences must be checked individually | Record exact font upstream and retain the corresponding licence notices if redistributing font files |
| `netlify-cli` development dependency | Package declared as `^17.0.0`; no lockfile observed | Resolve exact installed version and licence from package metadata; generate and review a lockfile before relying on reproducible builds |
| Odoo Community Edition 19 | LGPL-3.0 | Planned platform dependency, not currently vendored in this repository. Retain notices and comply with LGPL terms for the deployed/distributed combination |
| OCA Calendar / Resource Booking | OCA Calendar repository is AGPL-3.0 at repository level; each addon manifest can declare its own licence | **Excluded** from the selected booking implementation. Do not copy, adapt or add AGPL booking code or dependencies |
| AKTOps booking addon | Intended to be independently authored; final licence not selected | Keep a clean-room provenance record. Review the module's relationship to Odoo LGPL-3.0 and the intended commercial distribution model before choosing a licence |
| AgentSON | Separate project; not part of this repository | Not included as a dependency or codebase; assess its own licence independently |
| AK Build | Proprietary internal product/workflow | Not published here. Internal source, policy rules, prompts, orchestration, scoring and assurance implementation must remain private |

## Odoo licensing decision

1. Use Odoo Community Edition, not Enterprise Edition or Enterprise Appointments.
2. Odoo's official licensing documentation states that Odoo 19 Community Edition is licensed under LGPL version 3: https://www.odoo.com/documentation/19.0/legal/licenses.html.
3. The selected booking design is an independently authored AKTOps addon. The selected path does not incorporate OCA Resource Booking.
4. OCA Calendar's repository page identifies AGPL-3.0 as the repository licence and instructs users to inspect each addon's `__manifest__.py` for its specific licence: https://github.com/OCA/calendar.
5. A separate directory, process boundary or API call does not by itself settle whether code is a derivative or combined work. Have the actual addon, dependencies and delivery model reviewed before commercial distribution.

## Required release evidence

- [ ] Decide whether the repository itself is intended to remain unlicensed/all-rights-reserved or receive an explicit licence.
- [ ] Confirm copyright ownership and contributor permissions for all source and visual assets.
- [ ] Identify the origin/licence of `support.js` and recover or document its source tree.
- [ ] Resolve exact package versions and generate a lockfile.
- [ ] Record font family, upstream source, version and licence.
- [ ] Create an SPDX/CycloneDX SBOM for the actual production build.
- [ ] Review every Python, JavaScript, Odoo addon and system dependency.
- [ ] Record Odoo LGPL notices and source/version information.
- [ ] Confirm the AKTOps booking addon is independently authored and obtain legal review of its licence boundary.
- [ ] Keep AGPL booking code out of the selected implementation.

## Public/private evidence boundary

This file is a public summary. It intentionally does not publish proprietary AK Build internals, internal policy rules, secret values, raw scan logs, customer data or confidential legal advice. Public disclosure of a finding does not waive the need to preserve a private evidence trail.

## Sources

- Odoo 19 licensing: https://www.odoo.com/documentation/19.0/legal/licenses.html
- Odoo source licence: https://github.com/odoo/odoo/blob/19.0/LICENSE
- OCA Calendar licensing and per-addon licence guidance: https://github.com/OCA/calendar
