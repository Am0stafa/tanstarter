import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "#/lib/auth/middleware";

import { customerSearchSchema, queryCustomers } from "./customers";

/**
 * Server-driven table data: filtering/sorting/pagination happen here (not in
 * the browser), driven by the URL search params — the same shape a real
 * Drizzle-backed implementation would keep. Called via customersQueryOptions()
 * in queries.ts.
 *
 * authMiddleware guards the endpoint itself: route-level guards (_auth) only
 * protect navigation, not the generated server-fn HTTP endpoint.
 */
export const $getCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(customerSearchSchema)
  .handler(({ data }) => queryCustomers(data));
