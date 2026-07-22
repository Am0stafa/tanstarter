# UI Design System — Supabase Style

Every screen, component, and page in this app follows the **Supabase design language**: clean, developer-focused, content-dense, with the signature Supabase green as the single brand accent on calm neutral surfaces. This applies to all UI work — new features, refactors, and one-off pages alike. There is no other visual style in this codebase.

## Theme source of truth

- All colors, radii, shadows, and tracking are defined **only** in [src/styles.css](../src/styles.css) as CSS variables, applied from the tweakcn Supabase preset (<https://tweakcn.com/r/themes/supabase.json>).
- To adjust the theme, edit the variables in `styles.css` (or re-export from <https://tweakcn.com/editor/theme> → "Supabase" preset) — never restyle individual components to compensate.
- Deliberate deviation from the preset: the app font is **Inter Variable** (self-hosted via `@fontsource-variable/inter`), not Outfit — Inter is closer to Supabase's actual product typography. Do not introduce other fonts.

## Hard rules

1. **Semantic tokens only.** Use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, etc. Never hardcode colors — no `bg-green-500`, no `text-[#3ecf8e]`, no inline hex/oklch in components. If a token is missing, add it to `styles.css` (both `:root` and `.dark`) and map it in `@theme inline`.
2. **Both modes, always.** Every UI must look correct in light and dark mode. Tokens make this automatic — hardcoded colors break it. Dark mode is the flagship Supabase look; check it first. (To make dark the default: `<ThemeProvider defaultTheme="dark">` in `__root.tsx`.)
3. **Green is an accent, not a paint bucket.** Supabase UIs are overwhelmingly neutral. `primary` (brand green) is reserved for the main action per view, active/selected states, focus rings, and success signals. Secondary actions use `secondary`/`outline`/`ghost` button variants. Note: brand green as **text** (`text-primary`) is only readable on dark surfaces — for light-mode inline links use `text-foreground underline`, never `text-primary`.
4. **shadcn/ui first.** Add primitives with `vpr ui add <component>` and let them consume the theme. Do not hand-roll buttons, dialogs, dropdowns, or inputs that shadcn already provides.
5. **Flat, bordered surfaces.** Prefer `border border-border` + `bg-card` over heavy shadows. Shadows (`shadow-xs`…`shadow-lg`) are subtle by design in this theme — use them for elevation (popovers, dialogs), not decoration.
6. **Radius comes from the scale.** Use `rounded-sm/md/lg/xl` (derived from `--radius: 0.5rem`). Never arbitrary values like `rounded-[13px]`.

## Layout & typography

- **Density over whitespace**: Supabase-style apps are information-dense dashboards. Default to compact paddings (`p-4`/`p-6` cards, `gap-2`/`gap-4` stacks), 13–14px body text (`text-sm`), and full-width content areas with a fixed sidebar.
- **Headings**: `font-heading` (Inter), medium weight (`font-medium`/`font-semibold` — Supabase rarely uses bold-900), `text-foreground`. Page titles `text-2xl`, section titles `text-lg`, card titles `text-sm font-medium`.
- **Secondary text**: `text-muted-foreground text-sm` — used generously for descriptions, table metadata, timestamps.
- **Monospace** for identifiers: keys, IDs, code, URLs, env values render in `font-mono text-sm` (often inside a subtle `bg-muted rounded px-1.5`).
- **App chrome**: dashboard layouts use the `sidebar-*` tokens (add the shadcn `sidebar` component); page content sits on `background`, panels on `card`.

## Component patterns

- **Tables**: bordered, compact rows, `text-sm`, muted header row (`text-muted-foreground`), row hover `hover:bg-muted/50`.
- **Forms**: labels above inputs (`text-sm font-medium`), descriptions/errors below in `text-muted-foreground`/`text-destructive text-sm`. Inputs are `bg-input`-tinted flat fields with green focus ring (comes free from the theme's `--ring`).
- **Feedback**: use `sonner` toasts for async results; destructive confirmation dialogs before dangerous actions; skeletons (not spinners) for loading content areas; every list/table needs a designed empty state (icon + one-line explanation + primary action).
- **Charts**: use only `--chart-1` … `--chart-5` (`var(--chart-N)` in chart configs) — chart-1 is brand green and the default single-series color. Grid lines `border`, axis labels `muted-foreground`, no chart-library default palettes.
- **Icons**: `lucide-react` (`*Icon` suffix), `size-4` inline / `size-5` standalone, `text-muted-foreground` unless conveying state.

## Review checklist for UI changes

- [ ] No hardcoded colors, fonts, radii, or shadows — tokens only.
- [ ] Verified in **both** dark and light mode.
- [ ] One primary (green) action max per view; secondary actions use quieter variants.
- [ ] Empty, loading, and error states designed, not defaulted.
- [ ] Interactive elements have visible focus rings (theme handles it — don't remove them).
