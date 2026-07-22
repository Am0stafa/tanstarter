import * as z from "zod";

/**
 * Demo "customers" domain backing the /app dashboard, data table, and charts.
 *
 * The dataset is a deterministic in-memory stand-in for a database table so the
 * starter runs without migrations. To make it real: move the rows to a Drizzle
 * schema and translate `queryCustomers` into a SQL query inside $getCustomers —
 * the search schema, route, and UI stay unchanged.
 */

export const customerPlans = ["free", "pro", "enterprise"] as const;
export const customerStatuses = ["active", "trialing", "churned"] as const;

export type CustomerPlan = (typeof customerPlans)[number];
export type CustomerStatus = (typeof customerStatuses)[number];

export interface Customer {
  id: string;
  name: string;
  email: string;
  plan: CustomerPlan;
  status: CustomerStatus;
  /** Monthly recurring revenue in whole USD. */
  mrr: number;
  /** ISO date string — kept as string so it serializes cleanly through loaders. */
  createdAt: string;
}

/**
 * URL search-param contract for the customers table, shared by the route's
 * `validateSearch` and the `$getCustomers` server function input.
 * `.catch()` on every field means a hand-edited or stale URL degrades to
 * defaults instead of an error page.
 */
export const customerSearchSchema = z.object({
  q: z.string().trim().catch("").default(""),
  plan: z
    .enum(["all", ...customerPlans])
    .catch("all")
    .default("all"),
  status: z
    .enum(["all", ...customerStatuses])
    .catch("all")
    .default("all"),
  sort: z.enum(["name", "mrr", "createdAt"]).catch("createdAt").default("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc").default("desc"),
  page: z.number().int().min(1).catch(1).default(1),
});

export type CustomerSearch = z.infer<typeof customerSearchSchema>;

export const CUSTOMERS_PAGE_SIZE = 10;

export interface CustomerQueryResult {
  rows: Customer[];
  total: number;
  pageCount: number;
  /** Effective (clamped) page — may differ from the requested page. */
  page: number;
}

/**
 * Pure filter → sort → paginate over the dataset; the in-memory equivalent of
 * the WHERE/ORDER BY/LIMIT query a real implementation would run in Postgres.
 * Clamps `page` into range so an out-of-bounds URL still returns the last page.
 */
export function queryCustomers(search: CustomerSearch, data: Customer[] = customers) {
  const q = search.q.toLowerCase();

  const filtered = data.filter((customer) => {
    if (q && !customer.name.toLowerCase().includes(q) && !customer.email.toLowerCase().includes(q))
      return false;
    if (search.plan !== "all" && customer.plan !== search.plan) return false;
    if (search.status !== "all" && customer.status !== search.status) return false;
    return true;
  });

  const direction = search.order === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (search.sort === "mrr") return (a.mrr - b.mrr) * direction;
    if (search.sort === "name") return a.name.localeCompare(b.name) * direction;
    return a.createdAt.localeCompare(b.createdAt) * direction;
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / CUSTOMERS_PAGE_SIZE));
  const page = Math.min(search.page, pageCount);
  const start = (page - 1) * CUSTOMERS_PAGE_SIZE;

  return {
    rows: sorted.slice(start, start + CUSTOMERS_PAGE_SIZE),
    total: sorted.length,
    pageCount,
    page,
  } satisfies CustomerQueryResult;
}

/** Monthly series driving the dashboard charts and stat cards. */
export interface RevenuePoint {
  month: string;
  revenue: number;
  newCustomers: number;
}

export const monthlyRevenue: RevenuePoint[] = [
  { month: "Aug", revenue: 18200, newCustomers: 14 },
  { month: "Sep", revenue: 19800, newCustomers: 18 },
  { month: "Oct", revenue: 21400, newCustomers: 16 },
  { month: "Nov", revenue: 24100, newCustomers: 22 },
  { month: "Dec", revenue: 23500, newCustomers: 12 },
  { month: "Jan", revenue: 26900, newCustomers: 25 },
  { month: "Feb", revenue: 29300, newCustomers: 28 },
  { month: "Mar", revenue: 31800, newCustomers: 24 },
  { month: "Apr", revenue: 33200, newCustomers: 30 },
  { month: "May", revenue: 36700, newCustomers: 34 },
  { month: "Jun", revenue: 39400, newCustomers: 31 },
  { month: "Jul", revenue: 42800, newCustomers: 38 },
];

export const customers: Customer[] = [
  {
    id: "cus_001",
    name: "Acme Corp",
    email: "billing@acme.com",
    plan: "enterprise",
    status: "active",
    mrr: 2400,
    createdAt: "2025-01-14",
  },
  {
    id: "cus_002",
    name: "Globex",
    email: "ap@globex.io",
    plan: "pro",
    status: "active",
    mrr: 490,
    createdAt: "2025-02-02",
  },
  {
    id: "cus_003",
    name: "Initech",
    email: "peter@initech.dev",
    plan: "free",
    status: "trialing",
    mrr: 0,
    createdAt: "2026-06-19",
  },
  {
    id: "cus_004",
    name: "Umbrella Health",
    email: "ops@umbrella.health",
    plan: "enterprise",
    status: "active",
    mrr: 3200,
    createdAt: "2024-11-30",
  },
  {
    id: "cus_005",
    name: "Hooli",
    email: "gavin@hooli.xyz",
    plan: "pro",
    status: "churned",
    mrr: 0,
    createdAt: "2024-09-12",
  },
  {
    id: "cus_006",
    name: "Stark Industries",
    email: "pepper@stark.com",
    plan: "enterprise",
    status: "active",
    mrr: 5400,
    createdAt: "2024-08-21",
  },
  {
    id: "cus_007",
    name: "Wayne Enterprises",
    email: "lucius@wayne.co",
    plan: "enterprise",
    status: "active",
    mrr: 4800,
    createdAt: "2024-10-05",
  },
  {
    id: "cus_008",
    name: "Pied Piper",
    email: "richard@piedpiper.app",
    plan: "pro",
    status: "active",
    mrr: 290,
    createdAt: "2025-03-17",
  },
  {
    id: "cus_009",
    name: "Vandelay Industries",
    email: "art@vandelay.com",
    plan: "free",
    status: "active",
    mrr: 0,
    createdAt: "2025-05-09",
  },
  {
    id: "cus_010",
    name: "Wonka Labs",
    email: "willy@wonka.dev",
    plan: "pro",
    status: "trialing",
    mrr: 0,
    createdAt: "2026-07-01",
  },
  {
    id: "cus_011",
    name: "Cyberdyne Systems",
    email: "miles@cyberdyne.ai",
    plan: "enterprise",
    status: "active",
    mrr: 6100,
    createdAt: "2024-12-11",
  },
  {
    id: "cus_012",
    name: "Tyrell Corp",
    email: "eldon@tyrell.bio",
    plan: "pro",
    status: "churned",
    mrr: 0,
    createdAt: "2024-07-28",
  },
  {
    id: "cus_013",
    name: "Aperture Science",
    email: "cave@aperture.sci",
    plan: "pro",
    status: "active",
    mrr: 490,
    createdAt: "2025-04-22",
  },
  {
    id: "cus_014",
    name: "Black Mesa",
    email: "gordon@blackmesa.org",
    plan: "free",
    status: "active",
    mrr: 0,
    createdAt: "2025-06-30",
  },
  {
    id: "cus_015",
    name: "Dunder Mifflin",
    email: "michael@dundermifflin.com",
    plan: "pro",
    status: "active",
    mrr: 190,
    createdAt: "2025-01-29",
  },
  {
    id: "cus_016",
    name: "Prestige Worldwide",
    email: "brennan@prestige.ww",
    plan: "free",
    status: "churned",
    mrr: 0,
    createdAt: "2025-02-14",
  },
  {
    id: "cus_017",
    name: "Oscorp",
    email: "norman@oscorp.com",
    plan: "enterprise",
    status: "active",
    mrr: 2900,
    createdAt: "2025-03-03",
  },
  {
    id: "cus_018",
    name: "Massive Dynamic",
    email: "nina@massivedynamic.com",
    plan: "enterprise",
    status: "active",
    mrr: 3700,
    createdAt: "2024-06-18",
  },
  {
    id: "cus_019",
    name: "Soylent Corp",
    email: "sales@soylent.green",
    plan: "free",
    status: "trialing",
    mrr: 0,
    createdAt: "2026-07-15",
  },
  {
    id: "cus_020",
    name: "Gringotts",
    email: "goblin@gringotts.bank",
    plan: "pro",
    status: "active",
    mrr: 890,
    createdAt: "2025-05-27",
  },
  {
    id: "cus_021",
    name: "Monsters Inc",
    email: "sulley@monsters.inc",
    plan: "pro",
    status: "active",
    mrr: 490,
    createdAt: "2025-07-08",
  },
  {
    id: "cus_022",
    name: "Weyland-Yutani",
    email: "ellen@weyland.space",
    plan: "enterprise",
    status: "churned",
    mrr: 0,
    createdAt: "2024-05-02",
  },
  {
    id: "cus_023",
    name: "Buy n Large",
    email: "captain@bnl.earth",
    plan: "free",
    status: "active",
    mrr: 0,
    createdAt: "2025-08-19",
  },
  {
    id: "cus_024",
    name: "Nakatomi Trading",
    email: "joseph@nakatomi.jp",
    plan: "pro",
    status: "active",
    mrr: 690,
    createdAt: "2025-09-04",
  },
  {
    id: "cus_025",
    name: "Sirius Cybernetics",
    email: "marvin@sirius.galaxy",
    plan: "free",
    status: "trialing",
    mrr: 0,
    createdAt: "2026-06-25",
  },
  {
    id: "cus_026",
    name: "Octan Energy",
    email: "lord@octan.biz",
    plan: "pro",
    status: "active",
    mrr: 390,
    createdAt: "2025-10-13",
  },
  {
    id: "cus_027",
    name: "Rekall",
    email: "douglas@rekall.mars",
    plan: "pro",
    status: "churned",
    mrr: 0,
    createdAt: "2024-04-09",
  },
  {
    id: "cus_028",
    name: "Zorg Industries",
    email: "jean@zorg.multi",
    plan: "enterprise",
    status: "active",
    mrr: 4200,
    createdAt: "2025-11-21",
  },
  {
    id: "cus_029",
    name: "Gekko & Co",
    email: "gordon@gekko.capital",
    plan: "enterprise",
    status: "active",
    mrr: 5100,
    createdAt: "2025-12-02",
  },
  {
    id: "cus_030",
    name: "Bluth Company",
    email: "michael@bluth.build",
    plan: "free",
    status: "active",
    mrr: 0,
    createdAt: "2026-01-16",
  },
  {
    id: "cus_031",
    name: "Sterling Cooper",
    email: "don@sterlingcooper.ad",
    plan: "pro",
    status: "active",
    mrr: 790,
    createdAt: "2026-02-08",
  },
  {
    id: "cus_032",
    name: "Wernham Hogg",
    email: "david@wernhamhogg.uk",
    plan: "free",
    status: "churned",
    mrr: 0,
    createdAt: "2025-04-01",
  },
  {
    id: "cus_033",
    name: "Krusty Krab",
    email: "eugene@krustykrab.sea",
    plan: "pro",
    status: "active",
    mrr: 190,
    createdAt: "2026-03-12",
  },
  {
    id: "cus_034",
    name: "Los Pollos Hermanos",
    email: "gus@lospollos.mx",
    plan: "enterprise",
    status: "active",
    mrr: 3300,
    createdAt: "2026-04-05",
  },
  {
    id: "cus_035",
    name: "Central Perk",
    email: "gunther@centralperk.cafe",
    plan: "free",
    status: "active",
    mrr: 0,
    createdAt: "2026-05-14",
  },
  {
    id: "cus_036",
    name: "Paunch Burger",
    email: "dennis@paunchburger.in",
    plan: "pro",
    status: "trialing",
    mrr: 0,
    createdAt: "2026-07-11",
  },
  {
    id: "cus_037",
    name: "MomCorp",
    email: "carol@momcorp.earth",
    plan: "enterprise",
    status: "active",
    mrr: 7200,
    createdAt: "2024-03-25",
  },
  {
    id: "cus_038",
    name: "Planet Express",
    email: "hubert@planetexpress.ny",
    plan: "pro",
    status: "active",
    mrr: 290,
    createdAt: "2026-06-02",
  },
  {
    id: "cus_039",
    name: "Virtucon",
    email: "number2@virtucon.evil",
    plan: "enterprise",
    status: "churned",
    mrr: 0,
    createdAt: "2024-02-17",
  },
  {
    id: "cus_040",
    name: "InGen",
    email: "john@ingen.isla",
    plan: "enterprise",
    status: "active",
    mrr: 4600,
    createdAt: "2026-07-03",
  },
];
