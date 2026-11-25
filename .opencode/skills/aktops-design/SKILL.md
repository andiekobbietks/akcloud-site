---
name: aktops-design
description: Design, implement and review AKTOps website interfaces using the repository's full token catalogue, visual atlas, pixel-sampling protocol and Google Stitch workflow.
compatibility: opencode
---

# AKTOps design implementation skill

Use this skill for interface design, CSS changes, page/state implementation, visual review and design documentation.

## Read first

- `AGENTS.md`
- `DESIGN.md` (canonical written design contract)
- `docs/design-system.md`
- `docs/design/token-reference.md`
- `docs/design/pixel-sampling.md`
- `docs/design/stitch-workflow.md`

## Source-of-truth hierarchy

1. Inspect the current HTML/CSS/JS and preserve working behaviour.
2. Use root `DESIGN.md` as the canonical intended design contract.
3. Use `docs/design/token-reference.md` for the evidence-led token and component inventory.
4. Use `docs/design/visual-atlas.svg` as a visual index, not as a replacement for source inspection.
5. Use approved Google Stitch references as task-specific design proposals.
6. Label any new proposal clearly. Do not present it as an existing token.

The root `DESIGN.md` and `uploads/DESIGN.md` are near-duplicates with different brand descriptions. Treat the root file as canonical; do not edit the CMS upload copy as though it were a production token source.

## Role split

- **Google Stitch:** explore screen composition, visual direction, responsive variants and interaction states.
- **OpenCode:** inspect repository behaviour, implement approved changes, test and review.
- **Git:** preserve traceability through small, descriptive branches and commits.

Do not claim Stitch synchronises automatically with this repository. Review exports and generated code before integration.

## Brand constraints

- Canvas: `#080808`; surfaces: `#111111` and `#191919`; border: `#242424`.
- Signal green: `#39FF14`; primary text: `#FFFFFF`; body: `#C8C8C8`; muted: `#787878`; subdued: `#3A3A3A`.
- Error/glitch red: `#FF5555`, currently evidenced on the 404 chromatic offset only.
- Typography: Exo 2 for display/UI labels, DM Sans for body and fields, JetBrains Mono for operational metadata.
- Controls use 4px radii; cards/panels use 8px radii. Avoid pills.
- Keep glow layered and purposeful. Distinguish `text-shadow`/`box-shadow` diffusion from `filter: blur()` and `backdrop-filter`.
- Preserve the 404 chromatic split and Return to Base action. The 404 itself does not implement backdrop blur.
- Do not introduce generic glassmorphism, extra colours, fonts, decorative gradients or animation styles without a documented reason.

## Google Stitch hand-off

Supply Stitch with:
- the user problem, task scope and target journey;
- current screenshots and page/source context;
- token reference and visual atlas;
- explicit preserve constraints for brand, copy, routes, CMS and interactions;
- desktop/mobile layouts and relevant hover, focus, active, disabled, loading, empty and error states;
- annotations for glow, opacity, blur and layering;
- contrast, keyboard and reduced-motion requirements.

Treat Stitch output as a visual specification, not authoritative source code. Compare it with the current repository before implementation.

## Mandatory implementation workflow

1. Read the source and docs listed above.
2. Inspect the target page, styles, scripts, assets, CMS bindings and responsive rules.
3. Report material differences between the current implementation and any supplied Stitch reference before editing.
4. Identify affected routes, forms, CMS hooks, booking configuration and security controls.
5. Implement the smallest coherent change, reusing existing patterns.
6. Preserve Decap `data-cms` hooks, Netlify Forms/Functions contracts and the separate Odoo booking boundary.
7. Test keyboard focus, contrast, responsive layout, reduced motion and actual interactions.
8. Run available tests/build checks and inspect the complete diff.
9. Report files changed, tests run, visual states inspected, deviations and anything not verified.

## Pixel and asset evidence

- Do not invent pixel samples or infer tokens from a screenshot by eye.
- Follow `docs/design/pixel-sampling.md` for raster sampling.
- Record image path, file signature, SHA-256, dimensions, colour profile, coordinates/crop, pixel values and sample interpretation.
- Avoid antialiased edges, glow fall-off, transparent compositing and JPEG artefacts when identifying flat token colours.
- The visual atlas currently displays exact source-defined token values; it is not a screenshot-derived pixel histogram.
- Verify asset licences and provenance before committing imported/generated assets.

## Safety and quality gates

- Never put secrets, OAuth credentials, API keys or customer data in Stitch prompts, screenshots or commits.
- Do not upload private client material to external design tools.
- Do not add frameworks or dependencies without a documented requirement and trade-off.
- Do not deploy production unless explicitly requested.
- If the written spec and live UI conflict, document the conflict and seek an intentional decision. Do not silently rewrite existing behaviour.

## Definition of done

A design task is complete only when the user problem is addressed, source evidence is accurate, responsive and accessible states are checked, existing functionality is preserved, tests and diff review are complete, and unverified work is disclosed.
