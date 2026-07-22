import { createServerFn } from "@tanstack/react-start";

import { customerSearchSchema, queryCustomers } from "./customers";

/**
 * Server-driven table data: filtering/sorting/pagination happen here (not in
 * the browser), driven by the URL search params — the same shape a real
 * Drizzle-backed implementation would keep. Called via customersQueryOptions()
 * in queries.ts.
 */
export const $getCustomers = createServerFn({ method: "GET" })
  .validator(customerSearchSchema)
  .handler(({ data }) => queryCustomers(data));
