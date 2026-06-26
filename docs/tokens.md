# Beerlao Roulette — Design Token Reference

All tokens live in `src/styles/tokens.css` and are consumed via CSS custom properties.
No feature code should hardcode any color, spacing, or typography value — read from tokens.

---

## Background Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#08080f` | Page background |
| `--color-bg-surface` | `#111120` | Cards, panels |
| `--color-bg-elevated` | `#1a1a2e` | Modals, dropdowns |
| `--color-bg-overlay` | `rgba(8, 8, 15, 0.85)` | Semi-transparent overlays |

---

## Neon Accent Palette

| Token | Value | Role |
|---|---|---|
| `--color-neon-cyan` | `#00e5ff` | Primary accent, UI highlights |
| `--color-neon-magenta` | `#ff007a` | Secondary accent, danger |
| `--color-neon-lime` | `#39ff14` | Success, positive feedback |
| `--color-neon-gold` | `#ffd700` | Winner highlight |
| `--color-neon-orange` | `#ff6b00` | Warning, warm accent |
| `--color-neon-purple` | `#bf00ff` | Tertiary accent |
| `--color-neon-pink` | `#ff69b4` | Soft accent |
| `--color-neon-blue` | `#0066ff` | Info, cool accent |

---

## Wheel Segment Colors

The wheel cycles through these 8 colors per player, indexed `1`–`8`.
**These are the canonical colors for wheel segments — the Wheel component must use `--wheel-color-N` (not raw values) so color ownership stays in this token file.**

| Token | Value |
|---|---|
| `--wheel-color-1` | `#00e5ff` (cyan) |
| `--wheel-color-2` | `#ff007a` (magenta) |
| `--wheel-color-3` | `#39ff14` (lime) |
| `--wheel-color-4` | `#ffd700` (gold) |
| `--wheel-color-5` | `#bf00ff` (purple) |
| `--wheel-color-6` | `#ff6b00` (orange) |
| `--wheel-color-7` | `#ff69b4` (pink) |
| `--wheel-color-8` | `#0066ff` (blue) |

**Usage in JS (Canvas / SVG):** CSS variables are not readable by canvas directly. Use `getComputedStyle` at runtime:
```js
const color = getComputedStyle(document.documentElement)
  .getPropertyValue(`--wheel-color-${(index % 8) + 1}`)
  .trim()
```

---

## Text Colors

| Token | Usage |
|---|---|
| `--color-text-primary` | Body text, names |
| `--color-text-secondary` | Supporting text |
| `--color-text-muted` | Placeholders, captions |
| `--color-text-accent` | Alias → `--color-neon-cyan` |
| `--color-text-winner` | Alias → `--color-neon-gold` — winner reveal text |

---

## Glow Shadows

Glow tokens follow the pattern `--glow-{color}-{size}` where size is `sm`, `md`, or `lg`.

| Token | Usage |
|---|---|
| `--glow-cyan-sm/md/lg` | Primary UI glow, borders |
| `--glow-magenta-sm/md/lg` | Error states, accents |
| `--glow-lime-sm/md/lg` | Success states |
| `--glow-gold-sm/md/lg` | Winner reveal, highlights |
| `--glow-purple-sm/md` | Tertiary accents |

---

## Typography

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `Orbitron`, fallback monospace | Headings, labels, UI chrome |
| `--font-body` | `Inter`, fallback sans-serif | Body copy, player names |

### Font sizes (`--font-size-{key}`)
`xs` → `sm` → `md` → `lg` → `xl` → `2xl` → `3xl` → `4xl` → `5xl` → `6xl`

### Weights
`--font-weight-normal` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600), `--font-weight-bold` (700), `--font-weight-black` (900)

### Letter spacing
`--letter-spacing-tight` | `normal` | `wide` | `wider` | `widest`

---

## Spacing

Spacing uses a 4px base: `--space-1` (4px) through `--space-24` (96px).

---

## Transitions

| Token | Value | Usage |
|---|---|---|
| `--ease-spin` | `cubic-bezier(0.17, 0.67, 0.12, 0.99)` | **Wheel deceleration** — canonical, do not change |
| `--duration-spin-min` | `3000ms` | Minimum spin duration |
| `--duration-spin-max` | `6000ms` | Maximum spin duration |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General UI transitions |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful entrance animations |
| `--duration-fast` | `150ms` | Hover, focus transitions |
| `--duration-normal` | `300ms` | Standard UI transitions |
| `--duration-slow` | `600ms` | Page-level / dramatic transitions |

---

## Layout

| Token | Value | Usage |
|---|---|---|
| `--wheel-size-lg` | `clamp(320px, 55vmin, 600px)` | Projector / desktop wheel size |
| `--wheel-size-sm` | `clamp(200px, 40vmin, 400px)` | Tablet wheel size |
| `--max-width-game` | `1400px` | Max game stage width |

---

## Consumer Contract

The following modules depend on these tokens — changes to token **names** require updating all consumers:

| Consumer | Depends on |
|---|---|
| Wheel component (SIT-3) | `--wheel-color-1…8`, `--ease-spin`, `--duration-spin-min/max`, `--wheel-size-lg/sm` |
| Reveal / winner modal (SIT-5) | `--color-text-winner`, `--glow-gold-lg`, `--color-neon-gold` |
| Logic module `winnerIndex` (SIT-4) | No CSS — but `winnerIndex` is the output fed into Wheel |
| PlayerPanel (SIT-3) | `--wheel-color-1…8` (badge colors), `--color-neon-cyan` |

> Token **values** may be adjusted; token **names** are stable contracts.
