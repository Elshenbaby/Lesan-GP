# Design system

Inspired by the warm, hand-made feel of [prendslair.ca](https://www.prendslair.ca/#/friend-selection): paper
colors, outline buttons, a guide character who talks, and a topographic map as the child's world.

Tokens live in `frontend/src/design/tokens.css` (Tailwind v4 `@theme`), so every token is also a utility class
(`bg-rust`, `text-teal`, `font-display`, `ease-[var(--ease-out-cubic)]`…). Never hard-code a hex value in a
component; add a token instead.

## Color

| Token   | Hex       | Use                                         |
| ------- | --------- | ------------------------------------------- |
| `cream` | `#FCF7F1` | Page and card background, child stage       |
| `sand`  | `#EFE8DF` | App background, quiet surfaces              |
| `tan`   | `#D7C4AB` | Borders, nav box, text on teal              |
| `rust`  | `#BB4D34` | The one primary action per screen, alerts   |
| `teal`  | `#21393B` | Text, primary buttons, dark panels          |
| `sage`  | `#58635D` | Secondary text                              |
| `ok` / `warn` / `alert` | | Status only (traffic lights, badges). Never in child mode for "wrong". |

## Type

| Role     | Latin          | Arabic                 | Class          |
| -------- | -------------- | ---------------------- | -------------- |
| Display  | Young Serif    | Alexandria             | `font-display` |
| Body     | Manrope        | IBM Plex Sans Arabic   | `font-sans`    |
| Guide names | Caveat      | Aref Ruqaa             | `font-script`  |

Arabic fonts switch automatically under `:lang(ar)`.

## Shape and motion

- Buttons: 2px border, 5px radius, `hover-wash` (a skewed color wash that slides in on hover).
- Cards: `rounded-card`, soft shadow, optional `paper-grain`.
- Easing: `--ease-out-cubic` = `cubic-bezier(0.215, 0.61, 0.355, 1)` for everything; GSAP uses `power3.out`.
- Page transitions: `PageTransition` fades the page in and staggers every element marked `data-reveal`.
- Respect `prefers-reduced-motion` (handled in `global.css`).

## Signature components (`components/lisan`)

| Component        | What it is                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `CircleStage`    | The cream half-circle at the bottom of child screens with the guide     |
| `GuideDialog`    | Typewriter speech line; tap to finish, optional voice (`speak()`)       |
| `ContinueButton` | Rust corner panel with a compass; the only "next" control in child mode |
| `TopoMap` + `MapPin` | Hand-drawn contour map with a dashed trail and round pins (one per ladder level) |
| `GuideCard`      | Tilted playing card used for choosing a guide (Swiper deck)             |
| `MicButton`      | Big round record button with a live level ring                          |
| `StarBar`, `AccuracyMeter` | Effort-based rewards; the meter fills, it never shows a number |
| `TrafficLight`, `SeverityBadge` | Parent/therapist result display                          |

## Child-mode rules

1. No scores, percentages, or red X's. Stars are for trying.
2. One action per screen, and the guide always says what to do (voice + text).
3. Tap targets ≥ 64px. Text ≥ 20px.
4. Leaving child mode needs the parental gate (a sum).

## RTL

Arabic is the default (`<html dir="rtl">`). Use logical utilities (`ms-`, `pe-`, `start-`, `end-`, `text-start`)
instead of left/right. Directional icons flip with `rtl:-scale-x-100`. The map is the one exception: pins use
physical `left` and are mirrored with `mirrorX()` so the trail and pins stay aligned.
