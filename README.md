# TanStarter — batteries-included

> [!IMPORTANT]
> This template requires [Vite+ `vp`](https://viteplus.dev/guide/#install-vp) to be installed, and uses [pnpm](https://pnpm.io/installation) by default.

A batteries-included, AI-agent-friendly starter for building products on 🏝️ TanStack Start — forked from the excellent [mugnavo/tanstarter](https://github.com/mugnavo/tanstarter) and extended with a full Supabase-style design system, dashboard shell, and wired-up patterns for forms, tables, charts, and URL state.

## What's inside

**Core stack** (from upstream):

- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/) on [Base UI](https://base-ui.com/) (base-rhea)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL, [Better Auth](https://better-auth.com/) (email + GitHub/Google OAuth)
- [Vite 8](https://vite.dev) + [Nitro v3](https://nitro.build/) + [Vite+](https://viteplus.dev/) (Oxlint, Oxfmt, Vitest)

**Batteries added by this fork:**

- 🎨 **Supabase-style design system** — [tweakcn](https://tweakcn.com) Supabase theme applied as design tokens, enforced by [.agents/design.md](.agents/design.md); light + dark mode
- 🧭 **App shell** — collapsible icon sidebar, breadcrumb header, user menu ([/app](src/routes/_auth/app/route.tsx))
- ⌘K **Command palette** — global navigation + theme switching via cmdk ([command-menu.tsx](src/components/command-menu.tsx))
- 📊 **Charts** — Recharts through shadcn chart primitives, themed via `--chart-*` tokens ([dashboard](src/routes/_auth/app/index.tsx))
- 📋 **Data tables** — TanStack Table, server-driven filter/sort/pagination with state in the URL ([customers](src/routes/_auth/app/customers.tsx))
- 🔗 **Type-safe URL state** — zod-validated search params with graceful fallbacks (`validateSearch` + `stripSearchParams`)
- 📝 **Forms** — TanStack Form + Zod with a reusable shadcn field kit ([form.tsx](src/components/form.tsx), [settings](src/routes/_auth/app/settings.tsx))
- ✅ **Tests + CI** — Vitest via `vp test`, GitHub Actions running check/test/build on pushes to `main` and all PRs ([ci.yml](.github/workflows/ci.yml))
- 🤖 **AI-agent ready** — [AGENTS.md](AGENTS.md) + [CLAUDE.md](CLAUDE.md) + topic guides in [.agents/](.agents/) so coding agents follow the house patterns and design system
- ⚡ **Fast by default, with receipts** — prerendered landing page, hover preloading, layered caching, route-scoped heavy libs; measured prod TTFBs and the keep-it-fast rules live in [ROADMAP.md](ROADMAP.md)

## Getting Started

Prerequisites: [Node.js](https://nodejs.org/en/download) >= 24, [pnpm](https://pnpm.io/installation) >= 11, [Vite+](https://viteplus.dev/guide/#install-vp) (`vp`), and Docker (for the local database).

1. Clone and install:

   ```bash
   git clone https://github.com/Am0stafa/tanstarter.git my-product
   cd my-product && vp install
   ```

2. Create a `.env` file based on [`.env.example`](./.env.example), and start the local database:

   ```bash
   docker compose up -d      # local PostgreSQL
   vpr auth:secret           # generates BETTER_AUTH_SECRET
   ```

3. Generate and apply the initial migration:

   ```sh
   vpr db generate
   vpr db migrate
   ```

4. Run the development server:

   ```bash
   vpr dev
   ```

   Sign up at [http://localhost:3000](http://localhost:3000) and you land in the dashboard shell with the demo pages (dashboard, customers, settings). Build your product by replacing the demo pages — the patterns to copy are documented in [.agents/ui-patterns.md](.agents/ui-patterns.md).

## Working with AI agents

This repo is structured so coding agents (Claude Code, Cursor, Copilot, ...) produce consistent results:

- [AGENTS.md](AGENTS.md) is the entry point (with [CLAUDE.md](CLAUDE.md) pointing at it) — stack essentials plus an index of topic guides.
- [.agents/design.md](.agents/design.md) enforces the Supabase-style design system: semantic tokens only, both color modes, green as accent. Agents read it before any UI work.
- [.agents/ui-patterns.md](.agents/ui-patterns.md) holds copy-paste recipes for forms, tables, charts, URL state, and the command palette, each pointing at a working reference page in `src/routes/_auth/app/`.
- Validation is one command (`vpr check`), tests are `vpr test`, and CI repeats both — so agent output gets verified the same way everywhere.

## Deploying to production

The [vite config](./vite.config.ts) uses Nitro, which supports many [deployment presets](https://nitro.build/deploy) (Netlify, Vercel, Node.js, and more). Refer to the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for details.

## Issue watchlist

- [Router/Start issues](https://github.com/TanStack/router/issues) - TanStack Start is in RC.
- [Devtools releases](https://github.com/TanStack/devtools/releases) - TanStack Devtools is in alpha and may still have breaking changes.
- [Nitro v3 beta](https://nitro.build/blog/v3-beta) - The template is configured with Nitro v3 beta by default.
- [Drizzle ORM v1 RC](https://orm.drizzle.team/docs/relations-v1-v2) - Drizzle ORM v1 is in RC with relations v2.
- [Better Auth releases](https://github.com/better-auth/better-auth/releases) - We're using Better Auth v1.7 RC which supports Drizzle Relations v2.
- [Vite+ releases](https://github.com/voidzero-dev/vite-plus/releases) - Vite+ is in beta.

## Goodies

#### Scripts

Check [package.json](./package.json) for the full list of available scripts.

- **`auth:generate`** - Regenerate the [auth db schema](./src/lib/db/schema/auth.schema.ts) if you've made changes to your Better Auth [config](./src/lib/auth/auth.ts).
- **`db`** - Run [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) commands. (e.g. `vpr db generate`, `vpr db studio`)
- **`ui`** - The shadcn/ui CLI. (e.g. `vpr ui add data-table`)
- **`test`** - Run Vitest (`src/**/*.test.ts`; import from `vite-plus/test`).
- **`format`**, **`lint`** - Run Oxfmt and Oxlint, or both via `vpr check`.
- **`deps`** - Selectively upgrade dependencies via taze (versions are pinned).

#### Utilities

- [`auth/middleware.ts`](./src/lib/auth/middleware.ts) - Middleware for enforcing authentication on server functions & API routes.
- [`theme-toggle.tsx`](./src/components/theme-toggle.tsx), [`theme-provider.tsx`](./src/components/theme-provider.tsx) - Light/dark/system theme, FOUC-safe.
- [`format.ts`](./src/lib/format.ts) - Shared currency/number/date formatters used by tables, charts, and stat cards.

## License

Code in this template is public domain via [Unlicense](./LICENSE), same as the upstream template. Feel free to remove or replace for your own project.

## Upstream & ecosystem

- [mugnavo/tanstarter](https://github.com/mugnavo/tanstarter) - The upstream minimal template this fork builds on (also available as a [monorepo](https://github.com/mugnavo/tanstarter-monorepo)).
- [@tanstack/intent](https://tanstack.com/intent/latest/docs/getting-started/quick-start-consumers) - Up-to-date skills for your AI agents, auto-synchronized from your installed dependencies.
- [awesome-tanstack-start](https://github.com/Balastrong/awesome-tanstack-start) - A curated list of awesome resources for TanStack Start.
- [shadcn/ui Directory](https://ui.shadcn.com/docs/directory), [shoogle.dev](https://shoogle.dev/), [Evil Charts](https://evilcharts.com) - Component directories & registries for shadcn/ui.
