# Roadmap — batteries still missing, and how to add them without getting slow

This starter's reason to exist is **speed with batteries included**. This doc records (1) why dev feels slower than prod and what's already tuned, (2) the performance rules that keep it fast as it grows, and (3) every battery worth adding next — with what it's for, the recommended pick, and its true performance cost.

## 1. "It feels a little slow" — measured

What you feel in `vpr dev` is **dev mode, not the framework**. Dev serves every module individually, transforms on demand (including the React Compiler's Babel pass), runs the first-visit dependency optimizer (the one-time 30s+ stall on a cold start), and mounts the TanStack Devtools overlay. None of that exists in production.

Measured on the production build (`vp build` + `node .output/server/index.mjs`, local Postgres, warm server):

| Route                            | What happens                                         | TTFB          |
| -------------------------------- | ---------------------------------------------------- | ------------- |
| `/` (landing)                    | **Prerendered static HTML** — zero SSR work          | **~12–16 ms** |
| `/login`                         | Full SSR                                             | **~12 ms**    |
| `/app/customers` (authenticated) | Session check (cookie cache) + `$getCustomers` + SSR | **~27–31 ms** |

Rules of thumb: judge performance only on `vp build` output; keep one `vpr dev` running all day (warm dev is fast — cold start is what hurts); the devtools panel and a11y checker cost dev-only frames — the overlay is stripped from production bundles by the devtools Vite plugin (verified in `.output/public/assets`; TanStack Form keeps a few hundred bytes of inert devtools event shim, which is harmless without the panel).

## 2. Already tuned — don't re-add or undo these

- **Hover/touch preloading**: `defaultPreload: "intent"` in [router.tsx](src/router.tsx) — route code + loader data start loading before the click.
- **Layered caching**: React Query `staleTime` 2 min client-side; Better Auth `cookieCache` cuts session DB reads; every distinct table URL state is its own query cache entry (instant back/forward).
- **Route-level code splitting** (automatic): Recharts' ~120 KB gz lives only in the dashboard chunk; the landing page never downloads it.
- **Prerendered landing page**: `/` is baked to static HTML at build time ([vite.config.ts](vite.config.ts)). `crawlLinks` must stay **off** — crawling also bakes `/login`, `/signup`, and `/app` (as its login redirect), shadowing their live SSR. Add future marketing/docs pages to the `pages` array instead.
- **Immutable asset caching**: hash-named assets get `max-age=31536000, immutable` via [public/_headers](public/_headers).
- **Self-hosted variable font** (Inter via Fontsource — no third-party font request), **React Compiler** (auto-memoization; don't hand-write `memo`/`useMemo` for render perf), **server-driven tables** (10 rows over the wire, never the dataset).

## 3. Performance rules for every future battery

The costs that compound are client-side. The rule set (also in [.agents/performance.md](.agents/performance.md), which agents load):

1. **Server-first**: if a battery can run entirely in server functions/Nitro (email, jobs, payments webhooks, rate limiting), its client cost is zero — add freely.
2. **Heavy client libs are route-scoped or lazy**: follow the Recharts pattern (only in the routes that use it) or `React.lazy` below-the-fold widgets. Nothing heavy in `__root.tsx` — that's every page's bill.
3. **Icons**: already covered — `lucide-react` (per-icon named imports, tree-shaken to ~1 KB each) + `@icons-pack/react-simple-icons` for brand logos. Never add `react-icons` (breaks tree-shaking), icon fonts, or a second general-purpose set. Need an icon lucide lacks? Inline the SVG as a component.
4. **Banned by default**: `moment`/`dayjs` (use native `Intl` — see [format.ts](src/lib/format.ts)), `lodash` (native or nothing), `axios` (native `fetch`), runtime CSS-in-JS (Tailwind is compile-time), component mega-kits (MUI/AntD — duplicate shadcn at 10× the weight), tRPC (server functions are already end-to-end typed), `nuqs` (unsupported on Start — native search params). [.agents/performance.md](.agents/performance.md) is the authoritative list agents load.
5. **Measure on add**: `vp build` prints per-chunk sizes. If a PR grows a shared chunk by >20 KB gz, it needs a justification or a `lazy()`.

## 4. Missing batteries — what to add, the pick, and the cost

Ordered roughly by how soon a real product needs them.

| #   | Battery                    | Recommended pick                                                                                                                     | Why this pick                                                                                                                                                             | Client perf cost                           |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | **Transactional email**    | [Resend](https://resend.com) + [react-email](https://react.email)                                                                    | Templates are React components living next to your UI code; needed the day you enable email verification/password reset (Better Auth hooks exist for both)                | **Zero** — server-only                     |
| 2   | **Real CRUD reference**    | Drizzle-backed replacement for `src/lib/demo/`                                                                                       | The demo module documents this migration path; adds the missing mutation pattern (`useMutation` + `freshAuthMiddleware` + cache invalidation) agents will copy everywhere | Zero — swaps fake data for SQL             |
| 3   | **Organizations / RBAC**   | Better Auth `organization` plugin                                                                                                    | Already in your auth stack — teams, invites, roles with schema generated by `vpr auth:generate`; sidebar user menu is ready for an org switcher                           | ~Zero — a few KB of auth client            |
| 4   | **Rate limiting**          | Better Auth built-in `rateLimit` + Nitro route rules for API routes                                                                  | No new dependency; protects auth endpoints (the ones bots actually hit) from day one                                                                                      | Zero — server-only                         |
| 5   | **Background jobs**        | [pg-boss](https://github.com/timgit/pg-boss)                                                                                         | Uses the Postgres you already run — no Redis, no SaaS; covers emails, cleanup, webhooks. Graduate to Trigger.dev when jobs need observability/retries UI                  | Zero — server-only                         |
| 6   | **Payments**               | [Polar](https://polar.sh) (has an official Better Auth plugin) or Stripe                                                             | Polar is merchant-of-record (no tax handling) and wires into the existing auth plugin system in ~20 lines; Stripe if you need full control                                | Zero until a checkout page exists          |
| 7   | **File uploads**           | Presigned URLs to S3/R2 via a server fn                                                                                              | Browser uploads straight to storage — your server never proxies bytes; add an `AvatarField` to the form kit ([form.tsx](src/components/form.tsx))                         | Tiny — one fetch helper                    |
| 8   | **Error tracking**         | Sentry (TanStack Start SDK), **lazy-initialized after first idle**                                                                   | You can't fix what you can't see in prod; lazy init keeps its ~25–40 KB gz (more with tracing) off the critical path                                                      | Small, deferred — enforce the lazy pattern |
| 9   | **Analytics**              | [Plausible](https://plausible.io)/Umami (~1 KB script) for traffic; PostHog **only** when you need product analytics + feature flags | The 1 KB options are effectively free; PostHog eagerly loaded costs ~50 KB gz — load it lazily if adopted                                                                 | ~Zero / small-deferred                     |
| 10  | **Feature flags**          | Env-driven flags in [env](src/env/) first; PostHog flags when you need targeting                                                     | A typed `FLAGS` object costs nothing and covers 90% of launches                                                                                                           | Zero                                       |
| 11  | **E2E tests**              | Playwright against `docker compose` (reuse CI's DB pattern)                                                                          | The auth flow (signup → dashboard) is the one thing unit tests can't cover; catches integration-only bugs (e.g. a dialog that crashes only when actually opened)          | Zero — CI-only                             |
| 12  | **SEO kit**                | `sitemap.xml` + `robots.txt` server routes, OG-image endpoint via `satori`                                                           | Public pages are prerendered already; this completes discoverability. All server-side                                                                                     | Zero                                       |
| 13  | **Security headers**       | Extend [public/_headers](public/_headers): HSTS, `X-Content-Type-Options`, `Referrer-Policy`, CSP (report-only first)                | Free hardening; CSP needs care with Vite's inline preamble — hence report-only rollout                                                                                    | Zero                                       |
| 14  | **Production Dockerfile**  | Multi-stage: `pnpm install` → `vp build` → `node:24-slim` running `.output`                                                          | Deploy anywhere Nitro doesn't have a preset; pairs with the existing compose file                                                                                         | Zero                                       |
| 15  | **i18n** (when needed)     | [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)                                                             | Compile-time translations — only used messages ship, per-locale tree-shaking; the only i18n approach with ~zero runtime cost                                              | ~Zero (compile-time)                       |
| 16  | **Realtime** (when needed) | WebSockets via Nitro (experimental opt-in, crossws) or ElectricSQL for sync-heavy apps                                               | Don't add until a feature needs it — realtime client + reconnect logic is permanent weight; scope it to the routes that use it                                            | Moderate — route-scope it                  |

**Deliberately not added:** nuqs (its TanStack Router adapter doesn't support Start — native search params already do the job, see [.agents/ui-patterns.md](.agents/ui-patterns.md)); Zustand/Redux (TanStack Query + URL + local state covers this app shape; add Zustand only for genuinely global client state like multi-step wizards); PWA/service worker (cache-invalidation complexity is rarely worth it for auth'd dashboards); a second component library.

## 5. Suggested order of attack

1. **Email + real CRUD** (unblocks verification/reset + gives agents the mutation pattern)
2. **Rate limiting + security headers + E2E** (hardening, all zero-cost)
3. **Orgs/RBAC + payments** (the moment the product is multi-user or monetized)
4. **Sentry + analytics + jobs** (the moment real users arrive)
5. Everything else on demand — each addition judged against the rules in §3.
