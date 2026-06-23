---
version: alpha
name: AndieKobbieTech Solutions
description: >
  Phosphorescent circuit board aesthetic for a UK sovereign cloud architect
  and Microsoft Solutions Partner consultant. Dark matter surfaces with
  fluorescent neon green electrical charge running through every interaction.

colors:
  primary: "#39FF14"
  on-primary: "#080808"
  primary-dim: "#1FCC00"
  primary-mute: "rgba(57, 255, 20, 0.12)"
  secondary: "#FFFFFF"
  tertiary: "#191919"
  neutral: "#080808"
  surface-1: "#111111"
  surface-2: "#191919"
  border: "#242424"
  text-hi: "#C8C8C8"
  text-mid: "#787878"
  text-lo: "#3A3A3A"

typography:
  display:
    fontFamily: Exo 2
    fontSize: 4.5rem
    fontWeight: 900
    letterSpacing: 0.01em
    lineHeight: 1.0
  h1:
    fontFamily: Exo 2
    fontSize: 3rem
    fontWeight: 700
    letterSpacing: 0.01em
    lineHeight: 1.1
  h2:
    fontFamily: Exo 2
    fontSize: 2.25rem
    fontWeight: 700
    letterSpacing: 0.01em
    lineHeight: 1.15
  h3:
    fontFamily: Exo 2
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: DM Sans
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Exo 2
    fontSize: 0.75rem
    fontWeight: 700
    letterSpacing: 0.1em
    lineHeight: 1.0
  mono:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5

rounded:
  sm: 2px
  md: 4px
  lg: 8px
  full: 0px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  2xl: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 14px 28px
    shadow: "0 0 8px #39FF14, 0 0 24px rgba(57,255,20,0.50), 0 0 48px rgba(57,255,20,0.25)"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    shadow: "0 0 12px #39FF14, 0 0 32px rgba(57,255,20,0.55), 0 0 72px rgba(57,255,20,0.28), 0 0 120px rgba(57,255,20,0.12)"
    transform: translateY(-1px)
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 13px 27px
    border: "1px solid {colors.border}"
  button-ghost-hover:
    textColor: "{colors.primary}"
    border: "1px solid {colors.primary}"
    shadow: "inset 0 0 0 1px {colors.primary}, 0 0 6px #39FF14, 0 0 14px rgba(57,255,20,0.55)"
  service-card:
    backgroundColor: "{colors.surface-1}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: 32px
  service-card-hover:
    border: "1px solid rgba(57,255,20,0.30)"
    shadow: "0 0 0 1px rgba(57,255,20,0.15), 0 8px 32px rgba(0,0,0,0.40)"
  ms-badge:
    backgroundColor: "{colors.surface-1}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: 16px 24px
  nav:
    backgroundColor: "rgba(8,8,8,0.85)"
    border-bottom: "1px solid {colors.border}"
    height: 64px
    backdrop-filter: blur(12px)
  nav-link:
    textColor: "{colors.text-hi}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.secondary}"
    indicator-shadow: "0 0 6px #39FF14, 0 0 14px rgba(57,255,20,0.55)"
---

## Overview

Phosphorescent circuit board meets sovereign infrastructure.

AndieKobbieTech Solutions is the technical authority for UK organisations
navigating Microsoft's partner ecosystem, hybrid cloud architecture, and
digital sovereignty. The UI should feel like being inside the infrastructure
itself — dark matter with electrical charge escaping through the traces.

The fluorescent green (`#39FF14`) is not decorative. It is the charge carrier.
It appears only on interactive elements, key brand moments, and live system
indicators — never as background fill, never diluted. The contrast between
near-absolute black surfaces and the phosphorescent green is what makes the
brand feel genuinely lit rather than styled.

Target audience: founders, IT leads, and arts/public sector organisations
in the UK. The tone is precise, direct, and confident — the voice of someone
who builds the infrastructure rather than sells a slide deck about it.

## Colors

- **Primary (`#39FF14`):** Fluorescent neon green — the sole driver for all
  interaction. CTAs, active nav states, hover indicators, circuit traces.
  Carries a layered glow shadow at all times to simulate phosphorescent pigment
  under reflected light. Never use as a background fill — it must always appear
  as a light source against dark surfaces, not a colour block.
- **On-Primary (`#080808`):** Black text rendered on green buttons and badges.
  Ensures WCAG AA contrast on the primary colour.
- **Primary-Dim (`#1FCC00`):** Pressed/active state for green elements.
  Slightly darker to signal depression without losing the neon quality.
- **Primary-Mute (`rgba(57,255,20,0.12)`):** Tinted panel background for hover
  states on cards and menu items. Barely perceptible — implies the green
  without overwhelming the surface.
- **Secondary (`#FFFFFF`):** Pure white — used for "ANDIE", "TECH.", all
  display headings, and primary body text. One half of the brand name split.
- **Neutral (`#080808`):** Near-absolute black. Page background. Not pure black
  (`#000000`) — this retains a subtle warmth that prevents the background from
  feeling printed.
- **Surface-1 (`#111111`):** Primary content panels and cards. Distinguishable
  from the page background only in direct comparison.
- **Surface-2 (`#191919`):** Elevated surfaces — nav, modals, dropdown menus.
  The topmost visible layer before the green appears.
- **Border (`#242424`):** All dividing lines, card borders, input outlines.
  Subtle enough not to create a grid, present enough to define structure.
- **Text-Hi (`#C8C8C8`):** Secondary body copy, card descriptions, supporting
  content. Warm mid-grey — not cold.
- **Text-Mid (`#787878`):** Captions, metadata, timestamps, legal text.
- **Text-Lo (`#3A3A3A`):** Disabled states, placeholder text, decorative labels.

## Typography

Three families. Each has a specific role and must not be substituted.

- **Exo 2 (Display + Headings + Labels):** Geometric, technical, infrastructure-
  native. Used at weight 900 for display and brand text, 700 for section
  headings, 600 for sub-headings, 700 uppercase for all labels and button copy.
  Pairs the circuit board aesthetic with human legibility. Import from Google
  Fonts.
- **DM Sans (Body):** Warm geometric sans. Human-readable at all sizes without
  feeling corporate. Used exclusively for paragraph copy, card descriptions,
  form fields. Never for headings or interactive labels.
- **JetBrains Mono (Data + Code):** Used for technical specifications, ADR
  reference numbers, Microsoft Partner IDs, stack names, version strings, and
  any numerical data that needs to read as a system output rather than prose.

Brand name typographic rule — consistent across all display contexts:
  `ANDIE` → Secondary (#FFFFFF), weight 900
  `KOBBIE` → Primary (#39FF14), weight 900, glow-sm shadow
  `TECH.` → Secondary (#FFFFFF), weight 900
The trailing period is not punctuation — it is part of the brand mark.

## Layout

12-column grid. Max content width 1280px. Base spacing unit 8px.

Desktop section vertical rhythm: 96px top and bottom padding.
Mobile section vertical rhythm: 64px top and bottom padding.

Navigation bar: fixed, 64px height, full viewport width, backdrop blur.
Hero: full viewport height, content vertically centred at 40% from top.
Content sections: alternating single-column text and three-column card grids.
Maximum readable line length for body text: 72 characters (approximately 680px).

Background texture: a 48×48px repeating circuit grid at 3% green opacity
overlaid on the neutral background. Visible only when looked for — ambient
context, not decoration.

## Elevation & Depth

Depth is conveyed through glow, not shadow.

Traditional box shadows are not used in this system. Surfaces are
distinguished from each other by their background colour tokens
(neutral → surface-1 → surface-2 → border). No drop shadows appear
between stacked elements.

The single exception: the glow system applied to interactive elements
in the primary colour. Three intensity levels:

- **Glow-SM:** `0 0 6px #39FF14, 0 0 14px rgba(57,255,20,0.55)`
  Applied to interactive green elements at rest and to the AK logomark
  circuit traces. The near-field phosphorescence.
- **Glow-MD:** `0 0 8px #39FF14, 0 0 24px rgba(57,255,20,0.50), 0 0 48px rgba(57,255,20,0.25)`
  Applied on hover. The mid-diffusion layer — as if the surface has
  warmed under light.
- **Glow-LG:** `0 0 12px #39FF14, 0 0 32px rgba(57,255,20,0.55), 0 0 72px rgba(57,255,20,0.28), 0 0 120px rgba(57,255,20,0.12)`
  Applied on active/focus and to the primary CTA button at rest. Maximum
  ambient spread — a UV source illuminating the immediate area.

Apply glow only to elements rendered in the primary colour. Static text,
body copy, and decorative elements carry no glow — restraint here is
what makes the lit elements feel electrically charged by contrast.

## Shapes

Architectural precision. Minimal radius, no pill shapes.

All interactive elements: `rounded-md` (4px). Just enough softness to
feel contemporary — insufficient to feel friendly or rounded. This is
infrastructure, not consumer software.

Cards and panels: `rounded-lg` (8px). Slightly more generous to
distinguish containers from controls.

No `border-radius: 9999px` (pill) shapes anywhere in the system.
No circular avatar frames (use 4px radius square crops).

Service cards carry a circuit corner accent — a two-sided green border
bracket in the top-left corner that expands on hover (from 40×40px to
80×80px), carrying the glow-sm shadow. This is the signature micro-
interaction of the brand. It is built with a `::before` pseudo-element,
not a separate DOM element.

## Components

**Button — Primary**
Green fill, black text, uppercase label typography, 4px radius, 14px×28px
padding, glow-md shadow at rest, glow-lg on hover, translateY(-1px) on hover.
The primary CTA reads: `BOOK A CONSULTATION`.

**Button — Ghost**
Transparent, white text, 1px border in `{colors.border}`, same sizing as
primary. On hover: border transitions to primary green, text transitions to
primary green, inset glow-sm shadow appears. Used for secondary actions
(`SEE THE STACK →`, `VIEW ARCHITECTURE →`).

**Service Card**
Surface-1 background, border in `{colors.border}`, 8px radius, 32px padding.
Circuit corner accent in primary green (::before pseudo-element, top-left).
On hover: border colour transitions to `rgba(57,255,20,0.30)`, outer glow
appears (`0 0 0 1px rgba(57,255,20,0.15), 0 8px 32px rgba(0,0,0,0.40)`),
corner accent expands and brightens to glow-md.

**Microsoft Partner Badge**
Surface-1 background, border, 8px radius, 16px×24px padding. Microsoft logo
at 20px height (official lockup). Track name (`Data & AI`, `Digital & App
Innovation`) in primary green, label typography, glow-sm shadow.

**Navigation**
Fixed, 64px height, 85% opacity neutral background with 12px backdrop blur,
1px bottom border. Logo on left. Nav links centred or right-aligned. Primary
CTA button always visible on right. Nav links in label typography (uppercase,
0.1em tracking). Active state: white text, 2px underline in primary with
glow-sm, animated via `::after` pseudo-element width transition.

**Circuit Horizontal Rule**
Replaces all `<hr>` dividers between sections. A 1px line in `{colors.border}`
with an animated green pulse travelling left to right over 3 seconds, infinite.
The pulse is 20% of the rule width, gradient-faded at both ends, carrying
glow-md. Optional node dots (6px circles, primary green, glow-sm) at section
junctions. Animation respects `prefers-reduced-motion`.

**Section Label (Eyebrow)**
Label typography, primary green, glow-sm text-shadow, uppercase. Appears
above every section heading. Never used as a standalone element — always
paired with an `h2` or `h3` below it.

## Do's and Don'ts

- **Do** apply the primary green exclusively to interactive or key brand
  elements. Never use it as a background fill or decorative band.
- **Do** keep the KOBBIE portion of the brand name in primary green in all
  display contexts — hero, nav, footer, og:image.
- **Do** include the trailing period in `ANDIEKOBBITECH.` in all display uses.
- **Do** render all technical identifiers (partner IDs, ADR numbers, stack
  names, version strings) in JetBrains Mono at body-sm size.
- **Do** maintain WCAG AA contrast (4.5:1) on all text. On-primary (#080808)
  on primary (#39FF14) passes at 10.6:1. White on surface-1 passes at 15.8:1.
- **Do** respect `prefers-reduced-motion` — disable all animations including
  the circuit trace pulse when the user has requested reduced motion.
- **Don't** use more than two font weights on a single screen section.
- **Don't** use `border-radius` values larger than `rounded-lg` (8px) on any
  element. No pill shapes, no full-circle crops.
- **Don't** apply glow effects to body copy, paragraph text, or static labels.
  Glow is reserved for interactive and primary brand elements only.
- **Don't** render the green on any background lighter than `{colors.surface-2}`
  (#191919). The glow effect requires dark contrast — on light surfaces it
  reads as saturated lime, not phosphorescent charge.
- **Don't** add decorative gradients to background surfaces. Gradients appear
  only inside the animated circuit trace and the primary-mute hover tint.
- **Don't** use numbered section markers (01 / 02 / 03) — the content sections
  are not a sequential process and numbering would misrepresent the structure.
- **Don't** place more than one primary CTA per screen section.
