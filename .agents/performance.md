# Performance Rules

This starter is fast (prod TTFB: ~12 ms static, ~30 ms authed SSR — see [ROADMAP.md](../ROADMAP.md) §1) and must stay fast. Judge performance ONLY on `vp build` output, never on dev-server feel — dev pays on-demand transforms, the React Compiler pass, and devtools overhead that production doesn't.

## Hard rules for new code & dependencies

1. **Server-first.** If logic can live in a server function or Nitro route (email, jobs, webhooks, rate limits), it costs the client nothing. Prefer that over any client library.
2. **Heavy client libs are route-scoped or lazy.** Follow the Recharts pattern: imported only by routes that use it (router code-splits per route automatically). Never import anything heavy in `__root.tsx` or shared layout components — that's every page's bill. Use `React.lazy` for below-the-fold widgets.
3. **Icons are solved.** `lucide-react` (per-icon named imports — tree-shaken) + `@icons-pack/react-simple-icons` (brands). Never add `react-icons`, icon fonts, or another icon set. Missing icon → inline the SVG as a component.
4. **Banned dependencies:** `moment`/`dayjs` (use `Intl` via [src/lib/format.ts](../src/lib/format.ts)), `lodash` (native methods), `axios` (native `fetch`), runtime CSS-in-JS, MUI/AntD/Chakra (shadcn is the system), tRPC (server fns are already typed end-to-end), nuqs (unsupported on Start; native search params — see [ui-patterns.md](ui-patterns.md)).
5. **Don't hand-memoize.** The React Compiler handles `memo`/`useMemo`/`useCallback` for render performance. Write plain code.
6. **Tables/lists are server-driven.** Filter/sort/paginate on the server; ship one page of rows, never the dataset.
7. **Check the build.** `vp build` prints per-chunk sizes. Growing a shared chunk by >20 KB gzip requires justification in the PR/commit message, or a `lazy()`.
8. **Prerender additions:** new public marketing/docs pages go into the `pages` array in [vite.config.ts](../vite.config.ts). Keep `crawlLinks` off (it would bake auth routes as their login redirects).
