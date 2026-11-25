# Google Stitch workflow for AKTOps

This guide describes a repeatable design hand-off between Google Stitch and OpenCode.

## Use each tool for what it does best

| Tool | Responsibility | Not its responsibility |
|---|---|---|
| Google Stitch | Explore visual concepts, generate screen layouts, compare variants, communicate design intent | Final source of truth for repository behaviour, security or production readiness |
| OpenCode | Inspect existing source, implement approved screens, preserve integrations, test and review | Guessing visual intent from vague prompts |
| GitHub | Version, review and preserve the implementation history | Replacing visual QA |

No automatic Stitch synchronisation is assumed. Use the export/capture/import method available in your current Stitch interface and keep the hand-off explicit.

## Reusable Stitch prompt

Copy and adapt this brief when starting a new screen:

> Design a [SCREEN / COMPONENT] for AKTOps.
>
> **User problem:** [What is the user struggling to do?]
>
> **Desired outcome:** [What should they understand or complete?]
>
> **Existing context:** Use the supplied screenshot/reference as the existing product. Preserve its information architecture, brand identity, navigation and known interactions unless specifically asked to change them.
>
> **Visual system:** Near-black canvas #080808; raised surfaces #111111 and #191919; border #242424; signal green #39FF14; white headings; #C8C8C8 body text; muted #787878. Use Exo 2 for display/UI labels, DM Sans for body text and JetBrains Mono for operational metadata.
>
> **Signature treatment:** Controlled green chromatic glow using layered shadows and opacity. Use translucent dark surfaces and backdrop blur only where depth or overlay separation requires it. Do not turn every surface into glassmorphism. Keep text crisp and legible.
>
> **States:** Show desktop and mobile layouts plus relevant default, hover, focus, active, disabled, loading, empty and error states.
>
> **Accessibility:** Clear hierarchy, sufficient contrast, keyboard-visible focus, usable touch targets and reduced-motion alternative.
>
> **Constraints:** Do not introduce new colours, typefaces, unrelated sections, invented copy, new navigation or unnecessary dependencies. Do not remove existing functionality.
>
> Provide a concise explanation of layout decisions, token usage, responsive behaviour and any deviations from the supplied reference.

## Handoff into OpenCode

After Stitch exploration:

1. Export the approved screen or capture it at desktop and mobile sizes.
2. Save the references in a task-specific location, for example `design/references/<task-name>/`. Do not commit temporary exports unless they are useful project documentation.
3. Start OpenCode in the repository root.
4. Ask it to read `AGENTS.md`, `docs/design-system.md` and `.opencode/skills/aktops-design/SKILL.md`.
5. Supply the approved Stitch reference and ask for a comparison report before code changes.
6. Agree the scope, then implement incrementally.
7. Run tests and `netlify dev`; inspect the actual page at desktop and mobile widths.
8. Compare screenshots against Stitch and note any deliberate implementation differences.
9. Review the Git diff and commit with a descriptive message.

Example OpenCode task:

```text
Use the aktops-design skill. Read AGENTS.md and docs/design-system.md.
Inspect the existing [page/component] and compare it with the attached
approved Google Stitch references. First report the differences and
potential regressions. Do not edit until the scope is clear. Then implement
only the agreed changes, preserve all existing CMS/form/booking contracts,
run the available tests, and report desktop/mobile and accessibility checks.
```

## Asset and data hygiene

- Do not send credentials, API keys, private customer details or sensitive operational screenshots to Stitch.
- Verify rights and licence for generated or imported fonts, icons, illustrations and images.
- Prefer optimised, locally hosted assets where practical.
- Keep design references separate from production assets until approved.
