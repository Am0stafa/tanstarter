import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  MoreHorizontalIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "#/components/data-table";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { customerSearchSchema, type Customer, type CustomerSearch } from "#/lib/demo/customers";
import { customersQueryOptions } from "#/lib/demo/queries";
import { formatCurrency, formatDate } from "#/lib/format";
import { cn } from "#/lib/utils";

const defaultSearch = customerSearchSchema.parse({});

/**
 * The URL is the single source of truth for table state (filter, sort, page):
 * every state is shareable, refresh-safe, and back/forward works. The zod
 * schema validates params, the loader fetches through TanStack Query, and
 * stripSearchParams keeps default values out of the address bar.
 */
export const Route = createFileRoute("/_auth/app/customers")({
  validateSearch: customerSearchSchema,
  search: { middlewares: [stripSearchParams(defaultSearch)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(customersQueryOptions(deps)),
  component: CustomersPage,
});

const planLabels: Record<CustomerSearch["plan"], string> = {
  all: "All plans",
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const statusLabels: Record<CustomerSearch["status"], string> = {
  all: "All statuses",
  active: "Active",
  trialing: "Trialing",
  churned: "Churned",
};

/** Status dot colors come from chart/destructive tokens — never raw colors. */
const statusDotClass: Record<Customer["status"], string> = {
  active: "bg-chart-1",
  trialing: "bg-chart-4",
  churned: "bg-destructive",
};

function CustomersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(customersQueryOptions(search));

  const updateSearch = (patch: Partial<CustomerSearch>, replace = false) => {
    // Any filter/sort change resets to page 1 unless the patch says otherwise.
    navigate({ search: (prev) => ({ ...prev, page: 1, ...patch }), replace });
  };

  const sortableHeader = (label: string, field: CustomerSearch["sort"]) => {
    const isSorted = search.sort === field;
    const Icon = isSorted
      ? search.order === "asc"
        ? ArrowUpIcon
        : ArrowDownIcon
      : ArrowUpDownIcon;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-7 gap-1 text-xs font-medium text-muted-foreground"
        onClick={() =>
          updateSearch({
            sort: field,
            order: isSorted && search.order === "desc" ? "asc" : "desc",
          })
        }
      >
        {label}
        <Icon className={cn("size-3", isSorted && "text-foreground")} />
      </Button>
    );
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: () => sortableHeader("Customer", "name"),
      cell: ({ row }) => (
        <div className="grid leading-tight">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.plan}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 text-sm capitalize">
          <span
            className={cn("size-1.5 rounded-full", statusDotClass[row.original.status])}
            aria-hidden
          />
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "mrr",
      header: () => sortableHeader("MRR", "mrr"),
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums">{formatCurrency(row.original.mrr)}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => sortableHeader("Created", "createdAt"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <CustomerRowActions customer={row.original} />,
    },
  ];

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Everything is server-driven from URL state; the table only renders.
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: data.pageCount,
  });

  const hasActiveFilters = search.q !== "" || search.plan !== "all" || search.status !== "all";

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} customer{data.total === 1 ? "" : "s"} — filtered, sorted, and paginated on
          the server, driven entirely by the URL.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <DebouncedSearchInput
            value={search.q}
            onDebouncedChange={(q) => updateSearch({ q }, true)}
          />
          <Select
            items={planLabels}
            value={search.plan}
            onValueChange={(plan) => updateSearch({ plan: plan ?? "all" })}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(planLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={statusLabels}
            value={search.status}
            onValueChange={(status) => updateSearch({ status: status ?? "all" })}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => navigate({ search: defaultSearch })}
            >
              Reset
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>

        <DataTable
          table={table}
          emptyMessage={hasActiveFilters ? "No customers match your filters." : "No customers yet."}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {Math.min(search.page, data.pageCount)} of {data.pageCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={search.page <= 1}
              onClick={() => updateSearch({ page: search.page - 1 })}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={search.page >= data.pageCount}
              onClick={() => updateSearch({ page: search.page + 1 })}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Uncontrolled-feeling search box that pushes to the URL after a 300ms pause,
 * so typing doesn't spam history or refetch per keystroke. Resyncs when the
 * URL changes from elsewhere (Reset button, back/forward).
 */
function DebouncedSearchInput({
  value,
  onDebouncedChange,
}: {
  value: string;
  onDebouncedChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [lastSyncedValue, setLastSyncedValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive-during-render resync (https://react.dev/learn/you-might-not-need-an-effect):
  // when the URL value changes from elsewhere (Reset, back/forward), adopt it.
  if (lastSyncedValue !== value) {
    setLastSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => () => clearTimeout(timerRef.current ?? undefined), []);

  return (
    <Input
      value={draft}
      placeholder="Search name or email..."
      className="h-7 w-56 text-sm"
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onDebouncedChange(next), 300);
      }}
    />
  );
}

function CustomerRowActions({ customer }: { customer: Customer }) {
  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-xs" aria-label="Open row actions" />}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(customer.email);
              toast.success("Email copied to clipboard");
            }}
          >
            <CopyIcon />
            Copy email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
