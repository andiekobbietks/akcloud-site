---
name: aktops-design
description: Design, implement and review AKTOps website interfaces while preserving its existing visual identity. Use when working from Google Stitch screens, changing CSS, building pages or states, or reviewing visual consistency.
compatibility: opencode
---

# AKTOps design implementation skill

You are working in the AKTOps website repository. Follow `docs/design-system.md` as the visual contract.

## Role split

- **Google Stitch:** explore and communicate visual direction, screen composition, responsive variants and interaction states.
- **OpenCode:** inspect the repository, understand existing behaviour, implement the approved design, run checks and review the actual result.
- **Git:** preserve traceability through small, descriptive branches and commits.

Do not claim Stitch synchronises automatically with this repository. Treat exported code, screenshots and assets as inputs requiring review.

## Mandatory workflow

1. Read `docs/design-system.md` and inspect the target page/component before proposing changes.
2. Identify the user's actual problem, the affected user journey and the expected outcome.
3. Inspect current HTML, CSS, JavaScript, content bindings, assets and responsive rules. Reuse working patterns.
4. If a Stitch reference is supplied, compare it with the current implementation. List material differences before editing.
5. Preserve current brand tokens, typography, copy, routes, forms, CMS bindings and working interactions unless the task explicitly changes them.
6. Implement the smallest coherent change. Prefer shared styles over duplicated one-off CSS.
7. Test behaviour, keyboard access, responsive layout, reduced motion and contrast.
8. Run the repository's available tests and build command. Report anything that could not be tested.
9. Inspect the final diff for accidental content deletion, new dependencies, secrets, dead code and unrelated formatting.
10. Summarise files changed, tests run, remaining manual checks and any design deviations.

## Brand constraints

- Canvas: `#080808`; surfaces: `#111111` / `#191919`; borders: `#242424`.
- Signal accent: `#39FF14`; primary text: `#FFFFFF`; body: `#C8C8C8`; muted: `#787878`.
- Typography roles: Exo 2 (display/UI labels), DM Sans (body), JetBrains Mono (operational metadata).
- Keep glow layered and purposeful. Use it to communicate emphasis, focus or status, not as universal decoration.
- Distinguish neon shadow diffusion from actual `filter: blur()` and `backdrop-filter`.
- The current 404 is a reference for chromatic signal-loss styling; it does not itself implement backdrop blur.
- Do not introduce generic glassmorphism, gradients, colours, fonts, rounded-card systems or animation styles just because a design model suggests them.

## Google Stitch hand-off

When creating a Stitch prompt, include:
- What the screen must help the user accomplish.
- Existing page/screenshot context and what must remain unchanged.
- The token values and typography roles from `docs/design-system.md`.
- Specific glow, diffusion, transparency and blur instructions.
- Desktop and mobile requirements.
- Focus, hover, active, disabled, loading, empty and error states as relevant.
- Accessibility and reduced-motion requirements.

When implementing Stitch output:
- Treat it as a visual specification, not authoritative source code.
- Verify all generated assets, dependencies, routes and interactions.
- Do not paste an entire generated page over the existing site without understanding what it removes.
- Preserve Decap `data-cms` hooks, form names, Netlify attributes, booking configuration boundaries and security headers.
- Prefer adapting the existing vanilla HTML/CSS/JS architecture over introducing a framework or build pipeline without a clear requirement.

## Safety and quality gates

- Never put secrets, OAuth credentials, API keys or customer data in prompts, Stitch assets, screenshots or committed files.
- Do not upload private client material to external design tools.
- Check image/font licensing and provenance before committing assets.
- Avoid claiming a screen is production-ready based only on a Stitch preview.
- Do not deploy to production as part of a visual change unless explicitly requested.
- If a requirement conflicts with the design system, explain the conflict and propose the smallest justified exception.

## Definition of done

A task is done only when:
- The intended user problem is addressed.
- The result is consistent with the AKTOps visual system or a documented exception.
- Desktop and mobile behaviour are checked.
- Keyboard focus, contrast and reduced-motion behaviour are considered.
- Existing site functionality and CMS content bindings remain intact.
- Tests and diff review are complete, with limitations disclosed.
