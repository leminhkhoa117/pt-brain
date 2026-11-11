---
name: PT Brain
description: Sổ tay huấn luyện dựa trên bằng chứng cho PT và học viên.
colors:
  ink: "#1a211d"
  ink-secondary: "#5f6a61"
  ink-muted: "#9aa39b"
  paper: "#f5f6f2"
  paper-raised: "#edefe9"
  surface: "#fefffc"
  hairline: "#d8ddd4"
  hairline-strong: "#c3c9bf"
  pine: "#0e6b52"
  pine-deep: "#0b5642"
  pine-bright: "#5fbf9e"
  shell: "#0e1713"
  shell-text: "#e8e5db"
  vermilion: "#b8432c"
  ochre: "#a9761b"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, Cambria, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Source Serif 4, Georgia, Cambria, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  metric:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.04em"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.pine-deep}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0 12px"
    height: "40px"
---

# Design System: PT Brain

## Overview

**Creative North Star: "The Protocol Sheet"**

PT Brain is a working lab notebook, not a fitness dashboard. Every screen behaves like a protocol sheet: a label sits at the margin, the measurement sits on the same ruled line as its unit, and the reference range sits underneath in a quieter voice. The interface is dense where the work is dense and quiet where the work is quiet.

The world is built from paper, ink, hairline rules and one working accent. Depth comes from line weight and tonal layering, never from glass or glow. Source Serif headings give the product the authority of a clinical journal; Be Vietnam Pro keeps controls and prose neutral; Roboto Mono makes every measurement scannable across rows.

The anti-reference is explicit: the previous glassy emerald dashboard, gradient headlines, oversized rounded cards, floating hero metrics and decorative grid backgrounds are retired. Redesigns may change composition, but they inherit this protocol grammar.

**Key Characteristics:**
- Warm-cool paper ground with near-black ink, not pure white or cream.
- One pine accent for action and active state; vermilion and ochre only carry risk.
- Hairline rules and ruled rows instead of cards inside cards.
- Serif headlines over sans UI over mono measurements.
- Compact, tabular data with visible units and reference ranges.
- A single dark pine shell that stays dark in both themes.

## Colors

The palette is restrained: two neutrals, one working green, two signal colors. Colour is a job assignment, never decoration.

### Primary
- **Pine Ink** (#0e6b52): primary actions, active navigation, selected rows, chart line, focus rings, links. Deeper Pine (#0b5642) is the hover state; Pine Bright (#5fbf9e) is the dark-theme action and accent text.

### Secondary
- **Vermilion Seal** (#b8432c): destructive actions, errors, values outside a safe range, the danger zone. Never used for emphasis or decoration.
- **Ochre Flag** (#a9761b): caution, missing data, targets not yet met, the MA7 reference line. Never used for primary action.

### Neutral
- **Paper** (#f5f6f2): page ground in light mode. Slightly green-grey, never cream.
- **Raised Paper** (#edefe9): subtle fills, empty states, disabled surfaces.
- **Surface** (#fefffc): panels, inputs, modal sheets.
- **Ink** (#1a211d): body and headings. Secondary Ink (#5f6a61) for supporting copy, Muted Ink (#9aa39b) for dark-theme supporting copy only.
- **Hairline** (#d8ddd4) and **Hairline Strong** (#c3c9bf): all borders and dividers. Borders are 1px.
- **Pine Shell** (#0e1713): the fixed application sidebar, in light and dark mode. Shell Text (#e8e5db) is its foreground.

### Named Rules
**The One Signal Rule.** Pine appears only where a person can act, where they are, or what the data is doing. If pine is on a surface that is not interactive, active, or measured, remove it.

**The Hairline Rule.** Depth is a 1px line and a tonal step, not a shadow. Shadows belong only to overlays (menus, modals, tooltips) and to nothing that sits flat in the page.

## Typography

**Display Font:** Source Serif 4 (with Georgia, Cambria, serif)
**Body Font:** Be Vietnam Pro (with system-ui, sans-serif)
**Label/Mono Font:** Roboto Mono (with ui-monospace, monospace)

**Character:** A journal headline over a calm bilingual UI over a measurement face. The serif carries authority and gives long Vietnamese headings a human shape; the mono is reserved for numbers, units, reference ranges, table headers and short metadata, never for prose.

### Hierarchy
- **Display** (600, 34px/1.05, -0.02em): page titles only. One per screen.
- **Headline** (600, 20px/1.25, -0.01em): panel titles and modal titles.
- **Title** (600, 16–17px/1.3): section titles inside a panel.
- **Body** (400, 14px/1.6): prose and form values. Maximum measure 70ch.
- **Body Small** (400, 13px/1.55): supporting copy, table cells, navigation.
- **Label** (500, 11px/1.4, 0.1em, uppercase): field labels, metric labels, table headers, page metadata.
- **Metric** (500, 30px/1, -0.04em, tabular): the ruled measurement strip.

### Named Rules
**The Numbers Are Mono Rule.** Any number a user will compare down a column — weight, kcal, grams, sets, RPE, dates in a table — is set in Roboto Mono with tabular numerals and its unit in the sans face.

**The No-Kicker Rule.** A heading never gets a small uppercase label above it. Field labels and table headers are labels; page titles stand alone.

## Layout

The shell is fixed: a 248px pine sidebar at ≥1024px, a 64px icon rail from 768–1023px, and a top bar with a drawer plus a five-item bottom navigation below 768px. The content column is capped at 1320px with 32px gutters on desktop and 16px on mobile.

The page rhythm is a 4px base with 8/12/16/20/24/32/48 steps. A page opens with a title block separated from the work by a hairline; panels sit 16px apart. Dense data rows are 40–44px tall; forms use 36px controls. On desktop, summary data leads at two-thirds width and the action/log column follows at one-third; on mobile the action panel comes first.

Metadata is always set in mono at 11px, uppercase with 0.1em tracking. Section separation is a hairline, not a new card. Do not nest a bordered container inside another bordered container unless the inner one is a repeatable row or a form group that needs its own boundary.

## Elevation & Depth

The system is flat by default. At rest, a panel is a 1px hairline and a surface step; there is no drop shadow. Hover changes border colour or background tone, never lifts or floats. The only shadows are for things that leave the page plane: dropdowns, popovers, tooltips, the mobile drawer and modals, all using the overlay shadow below.

### Shadow Vocabulary
- **Overlay** (`0 24px 48px -24px rgba(11,15,13,0.45), 0 4px 12px -6px rgba(11,15,13,0.18)`): menus, modals, tooltips, the mobile drawer.

### Named Rules
**The Flat-By-Default Rule.** A surface at rest is flat. If a shadow is not explaining that an element floats above the page, delete it.

## Shapes

Corners are drafted, not soft: 4px for chips and badges, 6px for buttons and inputs, 8px for panels and modal sheets, 10px only for large media. No 16–24px card radii, no pill-shaped primary controls. The measured strip uses square corners and shared 1px dividers so the values read as one instrument, not four cards.

Borders are always 1px. No colored left or right border above 1px. No decorative grid backgrounds, gradients on text, glass blur, or glow halos. Icons are a single 1.7px-stroke family.

## Components

### Buttons
- **Shape:** 6px radius, 36px height, 14px horizontal padding, 13px semibold label.
- **Primary:** pine fill, warm-white text; hover deepens to Pine Ink; dark theme uses Pine Bright with Pine 950 text.
- **Secondary:** surface fill with a hairline border; hover strengthens the border and raises the paper tone.
- **Ghost:** no border, ink-secondary text; hover is a paper-2 fill.
- **Danger:** vermilion fill, white text; reserved for destructive confirmation.
- **Disabled:** paper-2 fill, muted ink, hairline border. Never reduce opacity until unreadable.

### Chips
- **Style:** 4px radius, 1px hairline, 11px mono uppercase for status; 6px radius, 12px sans for filters and equipment toggles.
- **State:** selected filters use pine fill or ochre fill with a check icon; unselected use surface with a hairline.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** surface on paper; the shell is pine.
- **Shadow Strategy:** none at rest; overlay only.
- **Border:** 1px hairline; strong hairline on hover.
- **Internal Padding:** 20px desktop, 16px mobile. Panel headers use a bottom hairline.

### Inputs / Fields
- **Style:** 36px height, 6px radius, surface fill, 1px hairline, 13px value, 11px mono uppercase label above.
- **Focus:** pine border plus a 2px pine/15% ring; never remove the ring.
- **Error / Disabled:** vermilion border and message; disabled uses a paper-2 fill and muted ink.
- **Native controls:** every select and file input is restyled; a raw browser file button is never shipped.

### Navigation
- **Style:** pine shell, 13px medium labels, 11px mono group labels at 55% shell text. Active item is a white/9% fill with a 4px pine dot; no colored border bars.
- **Mobile:** top bar with logo and menu, a drawer with the same grouped navigation, and a five-item bottom bar with 18px icons and 10px labels.

### The Ruled Measurement Strip (signature)
A single bordered band with four equal cells separated by 1px hairlines. Each cell carries a mono label, a 30px mono value with a sans unit, and a reference-range note. The strip is the first data a user sees after the page title; it is never four separate cards, never a hero with an icon tile.

### Tabs
A 40px underline tab bar: 13px semibold labels, 2px pine underline on the active tab, hairline rule across the full width. No filled pill tab bars.

### Tables
Left-aligned 11px mono uppercase headers, 13px body cells, 1px row rules, numeric cells right-aligned in Roboto Mono. Tables scroll horizontally before they wrap.

## Do's and Don'ts

### Do:
- **Do** start every page with a serif title and one line of context, then a hairline, then the work.
- **Do** put units and reference ranges next to every measurement.
- **Do** use mono for comparable numbers and dates in tables.
- **Do** use pine for action and state, vermilion for risk, ochre for caution, and nothing else for colour.
- **Do** keep 8px between related controls, 16px between groups, 24–32px between sections.
- **Do** verify the rendered page at 390px and 1440px before calling a screen finished.
- **Do** keep the dark theme a true theme: same hierarchy, same hairlines, pine brightened for contrast.

### Don't:
- **Don't** use gradient text, glass blur as decoration, glow halos, or decorative grid backgrounds.
- **Don't** use a kicker or eyebrow above a heading.
- **Don't** nest a card inside a card; use a ruled row, a divider or a labelled section.
- **Don't** use 16–24px radii, pill primary buttons, or floating hero metric cards.
- **Don't** use colored left borders, heavy shadows, or lift-on-hover.
- **Don't** use a raw browser file input, select, or checkbox without styling.
- **Don't** invent a second accent; if a new state needs colour, assign it a job first.
