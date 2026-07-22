import { describe, expect, it } from "vite-plus/test";

import { CUSTOMERS_PAGE_SIZE, customers, customerSearchSchema, queryCustomers } from "./customers";

const defaults = customerSearchSchema.parse({});

describe("customerSearchSchema", () => {
  it("degrades invalid params to defaults instead of throwing", () => {
    const parsed = customerSearchSchema.parse({
      plan: "platinum",
      status: 42,
      sort: "../etc/passwd",
      page: -5,
    });
    expect(parsed).toEqual(defaults);
  });
});

describe("queryCustomers", () => {
  it("returns the first page sorted by newest by default", () => {
    const result = queryCustomers(defaults);
    expect(result.rows).toHaveLength(CUSTOMERS_PAGE_SIZE);
    expect(result.total).toBe(customers.length);
    const dates = result.rows.map((row) => row.createdAt);
    expect(dates).toEqual([...dates].sort((a, b) => a.localeCompare(b)).reverse());
  });

  it("matches q against name and email, case-insensitively", () => {
    const byName = queryCustomers({ ...defaults, q: "acme" });
    expect(byName.rows.map((r) => r.name)).toContain("Acme Corp");

    const byEmail = queryCustomers({ ...defaults, q: "wayne.co" });
    expect(byEmail.rows.map((r) => r.name)).toContain("Wayne Enterprises");
  });

  it("combines plan and status filters", () => {
    const result = queryCustomers({ ...defaults, plan: "enterprise", status: "churned" });
    expect(result.total).toBeGreaterThan(0);
    expect(result.rows.every((r) => r.plan === "enterprise" && r.status === "churned")).toBe(true);
  });

  it("sorts by mrr ascending", () => {
    const result = queryCustomers({ ...defaults, sort: "mrr", order: "asc" });
    const values = result.rows.map((r) => r.mrr);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it("clamps out-of-range pages to the last page and reports the effective page", () => {
    const result = queryCustomers({ ...defaults, page: 999 });
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.pageCount).toBe(Math.ceil(customers.length / CUSTOMERS_PAGE_SIZE));
    // The UI paginates from this value, so it must be the clamped page, not 999.
    expect(result.page).toBe(result.pageCount);
  });

  it("reports an empty result set with pageCount 1", () => {
    const result = queryCustomers({ ...defaults, q: "zzz-no-such-customer" });
    expect(result).toEqual({ rows: [], total: 0, pageCount: 1, page: 1 });
  });
});
