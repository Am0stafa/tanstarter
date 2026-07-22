# UI Patterns — Forms, Tables, Charts, URL State, Command Palette

Copy-paste recipes for the batteries wired into this starter. Reference implementations live in the `/app` routes — read them before building similar features. Styling rules live in [design.md](design.md).

## URL state (search params) — the default for shareable UI state

Filters, sorting, pagination, tabs, and anything a user might want to share/bookmark/refresh belongs in **URL search params**, not useState. Use TanStack Router's native, type-safe search params (we deliberately do NOT use nuqs — its TanStack Router adapter is experimental and does not support TanStack Start).

Reference: [src/routes/_auth/app/customers.tsx](../src/routes/_auth/app/customers.tsx)

```tsx
const searchSchema = z.object({
  // .catch() → a bad/stale URL degrades to defaults instead of an error page
  q: z.string().trim().catch("").default(""),
  page: z.number().int().min(1).catch(1).default(1),
});

export const Route = createFileRoute("/_auth/app/things")({
  validateSearch: searchSchema, // zod IS the validator
  search: { middlewares: [stripSearchParams(searchSchema.parse({}))] }, // keep defaults out of the URL
  loaderDeps: ({ search }) => search, // loader re-runs when search changes
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(thingsQueryOptions(deps)),
  component: Page,
});

// In the component: read + write
const search = Route.useSearch();
const navigate = Route.useNavigate();
navigate({ search: (prev) => ({ ...prev, page: 1, q }), replace: true }); // replace for keystrokes
```

## Data tables — TanStack Table, server-driven

Tables are **server-driven**: the server function filters/sorts/paginates (SQL in real life), the URL holds the state, TanStack Table only renders. Never pull the full dataset to the client to sort it there.

- Reusable renderer: [src/components/data-table.tsx](../src/components/data-table.tsx) (takes a `table` instance, renders rows + empty state).
- Full example with toolbar (debounced search input, Select filters, reset), sortable headers, pagination, and row actions: [customers.tsx](../src/routes/_auth/app/customers.tsx).
- Set `manualSorting/manualFiltering/manualPagination: true` and `pageCount` from the server result; use `getCoreRowModel` only.
- Share one zod schema between `validateSearch` and the server function's `.validator()` so URL and API can never drift ([src/lib/demo/customers.ts](../src/lib/demo/customers.ts)).

## Forms — TanStack Form + Zod via `useAppForm`

Never hand-roll form state. Use the app form kit: [src/components/form.tsx](../src/components/form.tsx). Reference page: [settings.tsx](../src/routes/_auth/app/settings.tsx).

```tsx
const form = useAppForm({
  defaultValues: { name: "" },
  validators: { onSubmit: myZodSchema },
  onSubmit: async ({ value }) => {
    /* call a server-fn mutation, then toast */
  },
});

<form
  onSubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
  }}
>
  <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
  <form.AppForm>
    <form.SubmitButton>Save</form.SubmitButton>
  </form.AppForm>
</form>;
```

Available field components: `TextField`, `TextareaField`, `SwitchField`. To add one (select, checkbox, date...): write a component that calls `useFieldContext<T>()`, wrap it in the shared `FieldShell`, and register it in `fieldComponents` in form.tsx. Submit feedback via `sonner` toasts; errors render under the control automatically.

## Charts — Recharts via shadcn chart primitives

Use `ChartContainer` + `ChartTooltip` from [src/components/ui/chart.tsx](../src/components/ui/chart.tsx) with Recharts. Reference: the dashboard ([_auth/app/index.tsx](../src/routes/_auth/app/index.tsx)).

- Series colors come ONLY from theme tokens: `color: "var(--chart-1)"` … `var(--chart-5)` in the `ChartConfig`, referenced in marks as `var(--color-<seriesKey>)`. `--chart-1` is brand green — the default single-series color.
- Axes: `tickLine={false} axisLine={false}`, grid `vertical={false}` — the container styles ticks/grid to theme colors automatically.
- Keep charts inside a `Card` with a `text-sm font-medium` title and a muted description.
- For fancier animated variants, [Evil Charts](https://evilcharts.com) components are shadcn-compatible and drop into the same `ChartContainer`/token system — restyle any registry component to tokens before shipping.

## Command palette (⌘K)

[src/components/command-menu.tsx](../src/components/command-menu.tsx) owns the shortcut, the trigger button, and the dialog (cmdk via shadcn `command`). **Every new page must be added in three places, kept in sync:**

1. `navItems` in [app-sidebar.tsx](../src/components/app-sidebar.tsx) (sidebar entry)
2. `pageTitles` in [app-header.tsx](../src/components/app-header.tsx) (breadcrumb)
3. A `CommandItem` in command-menu.tsx (palette entry)

## Demo data

`src/lib/demo/` is a deterministic in-memory stand-in for a real table, so the starter runs without migrations. When building your product's first real feature, copy its shape — schema → server fn (`.middleware([authMiddleware]).validator(zodSchema)`) → `queryOptions` → route loader — but back it with Drizzle, then delete the demo module and its routes.

**Server functions are public HTTP endpoints.** Route-level guards (`_auth`) only protect navigation — every server fn that returns non-public data must carry `authMiddleware` (or `freshAuthMiddleware` for sensitive mutations) itself, as `$getCustomers` does. See [.agents/auth.md](auth.md).
