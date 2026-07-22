import { queryOptions } from "@tanstack/react-query";

import type { CustomerSearch } from "./customers";
import { $getCustomers } from "./functions";

/**
 * The whole (validated) search object is the query key, so every distinct
 * URL state — filter, sort, page — gets its own cache entry and navigating
 * back to a previously seen state renders instantly from cache.
 */
export const customersQueryOptions = (search: CustomerSearch) =>
  queryOptions({
    queryKey: ["customers", search],
    queryFn: ({ signal }) => $getCustomers({ data: search, signal }),
  });
