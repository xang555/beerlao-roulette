# Beerlao Roulette

Add names. Spin. The chosen one finishes the Beerlao.

## Stack

- **Vite** + **React 18** (JSX)
- **No CSS framework** — all styling via CSS custom properties (design tokens)

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production static bundle → dist/
npm run preview    # preview the production build
```

## Design System

All visual tokens are in [`src/styles/tokens.css`](src/styles/tokens.css).
Full reference: [`docs/tokens.md`](docs/tokens.md).

**Do not hardcode any color, spacing, or typography value in feature code.** Read from `--css-variable` tokens.

## Project Structure

```
src/
  components/
    PlayerPanel/    # Add/remove players, validation
    WheelStage/     # Spinning wheel canvas + spin button
  hooks/            # Shared React hooks
  styles/
    tokens.css      # Design token definitions (cross-issue contract)
    global.css      # Reset, base typography, shared primitives
  App.jsx           # App shell and layout
  main.jsx          # Entry point
docs/
  tokens.md         # Token reference for all sub-issues
```

## Token Contract

Token names are stable across sub-issues. See [`docs/tokens.md`](docs/tokens.md) for which tokens each sub-issue consumes.
