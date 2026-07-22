import { describe, expect, it } from "vite-plus/test";

import { formatCompact, formatCurrency, formatDate, formatDelta } from "./format";

describe("formatCurrency", () => {
  it("formats whole dollars without cents", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatCompact", () => {
  it("compacts large numbers", () => {
    expect(formatCompact(12500)).toBe("12.5K");
    expect(formatCompact(1200000)).toBe("1.2M");
    expect(formatCompact(999)).toBe("999");
  });
});

describe("formatDate", () => {
  it("formats ISO strings deterministically in UTC regardless of local timezone", () => {
    expect(formatDate("2026-01-05T00:00:00.000Z")).toBe("Jan 5, 2026");
    expect(formatDate("2025-01-14")).toBe("Jan 14, 2025");
  });

  it("returns a placeholder for invalid dates instead of throwing", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDelta", () => {
  it("signs positive and negative deltas", () => {
    expect(formatDelta(12.54)).toBe("+12.5%");
    expect(formatDelta(-3.2)).toBe("-3.2%");
    expect(formatDelta(0)).toBe("0.0%");
  });
});
