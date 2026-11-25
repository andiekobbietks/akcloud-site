# AKTOps repository instructions

## Project context

This is the AKTOps static website repository. It uses vanilla HTML, CSS and JavaScript with Netlify hosting, Netlify Forms/Functions and Decap CMS. Odoo Community 19 booking integration is a separate planned service; do not move Odoo credentials or database access into this static frontend.

## Design workflow

- Read `docs/design-system.md` before changing visual design.
- Use the `aktops-design` skill in `.opencode/skills/aktops-design/SKILL.md` for design implementation and review.
- Google Stitch is used for visual exploration and screen hand-off; OpenCode is used for repository inspection, implementation, testing and review.
- Never assume automatic Stitch-to-GitHub synchronisation. Review exported designs and code before integrating them.
- Preserve existing brand, content, routes, forms, CMS bindings and working interactions unless the task explicitly changes them.

## Engineering constraints

- Prefer the existing vanilla HTML/CSS/JS architecture. Add frameworks or dependencies only with a clear requirement and documented trade-off.
- Keep secrets out of source, prompts, screenshots and commits.
- Preserve Decap CMS `data-cms` hooks and content contracts.
- Respect accessibility, keyboard navigation, responsive layouts and `prefers-reduced-motion`.
- Run `npm test` and `npm run test:ui` for website changes; inspect Playwright screenshots and accessibility JSON artifacts.
- Do not update screenshot baselines until current-brand desktop/mobile captures have been reviewed and explicitly approved.
- Do not deploy production without explicit instruction.
- Use small, descriptive commits and review the complete diff before proposing a merge.

## CI/CD and visual evidence

- GitHub Actions runs static tests, Playwright interactions, responsive checks, design-token assertions and axe-core scans on pull requests and `master`.
- The post-deploy smoke workflow checks the public Netlify deployment after pushes to `master`.
- Netlify Git integration remains the deployment mechanism; GitHub Actions must not deploy production without explicit approval.
- See `docs/engineering/visual-assurance-ci.md` for test coverage and artifact handling.

## Required completion report

State the problem addressed, files changed, checks run, visual states inspected, known limitations and any manual deployment or OAuth steps still required.
