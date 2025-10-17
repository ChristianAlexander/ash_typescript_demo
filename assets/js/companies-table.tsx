import React, { useEffect, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  listCompanies,
  type SuccessDataFunc,
  buildCSRFHeaders,
} from "./ash_rpc";

// Type definitions
type Company = {
  id: string;
  ticker: string;
  name: string;
  cik: number;
  exchange?: {
    name: string;
  } | null;
};

type CompaniesData = SuccessDataFunc<typeof listCompanies>;

// Column helper for type safety
const columnHelper = createColumnHelper<Company>();

export const CompaniesTable = () => {
  const PAGE_SIZE = 25;

  // Infinite query for fetching companies data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["companies"],
    queryFn: async ({ pageParam }) => {
      const page = pageParam
        ? { after: pageParam as string, limit: PAGE_SIZE }
        : { limit: PAGE_SIZE };

      const result = await listCompanies({
        fields: ["id", "ticker", "name", "cik", { exchange: ["name"] }],
        page,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(
          (result as Extract<typeof result, { success: false }>).errors[0]
            ?.message || "Failed to fetch companies",
        );
      }

      return result.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
  });

  // Flatten paginated data into a single array
  const companies = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) ?? [];
  }, [data]);

  // Column definitions
  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      columnHelper.accessor("ticker", {
        header: "Ticker",
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {info.getValue()}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor("name", {
        header: "Company Name",
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900 truncate">
            {info.getValue()}
          </div>
        ),
        size: 300,
      }),
      columnHelper.accessor("exchange.name", {
        header: "Exchange",
        cell: (info) => (
          <div className="text-sm text-gray-600">{info.getValue() || "—"}</div>
        ),
        size: 150,
      }),
      columnHelper.accessor("cik", {
        header: "CIK",
        cell: (info) => (
          <div className="text-sm font-mono text-gray-600">
            {info.getValue()}
          </div>
        ),
        size: 120,
      }),
    ],
    [],
  );

  // Initialize table
  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: companies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height in pixels
    overscan: 5,
  });

  // Intersection Observer for infinite scrolling with virtualization
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= companies.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    companies.length,
    virtualizer.getVirtualItems(),
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Companies</h1>
          <p className="text-lg text-gray-600">Browse all listed companies</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading companies...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Companies</h1>
          <p className="text-lg text-gray-600">Browse all listed companies</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-red-200 p-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">
              Failed to load companies
            </div>
            <p className="text-gray-600">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Companies</h1>
        <p className="text-lg text-gray-600">Browse all listed companies</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="grid grid-cols-12 gap-4 px-6 py-3"
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={`
                    text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${header.id === "ticker" ? "col-span-2" : ""}
                    ${header.id === "name" ? "col-span-5" : ""}
                    ${header.id === "exchange_name" ? "col-span-2" : ""}
                    ${header.id === "cik" ? "col-span-3" : ""}
                  `}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Virtualized Scrollable Table Body */}
        <div
          ref={parentRef}
          className="h-96 overflow-y-auto bg-white"
          style={{ contain: "strict" }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = table.getRowModel().rows[virtualItem.index];
              if (!row) return null;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className={`
                        flex items-center
                        ${cell.column.id === "ticker" ? "col-span-2" : ""}
                        ${cell.column.id === "name" ? "col-span-5" : ""}
                        ${cell.column.id === "exchange_name" ? "col-span-2" : ""}
                        ${cell.column.id === "cik" ? "col-span-3" : ""}
                      `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div
                style={{
                  position: "absolute",
                  top: `${virtualizer.getTotalSize()}px`,
                  left: 0,
                  width: "100%",
                  height: "60px",
                }}
                className="grid grid-cols-12 gap-4 px-6 py-4"
              >
                <div className="col-span-12 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Loading more companies...
                  </span>
                </div>
              </div>
            )}

            {/* End of results message */}
            {!hasNextPage && companies.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: `${virtualizer.getTotalSize()}px`,
                  left: 0,
                  width: "100%",
                  height: "80px",
                }}
                className="text-center py-8"
              >
                <p className="text-gray-500 text-sm">
                  You've reached the end of the list
                </p>
              </div>
            )}

            {/* Empty state */}
            {companies.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No companies found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results counter */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {companies.length} companies
        {data?.pages[0]?.hasMore && " (scroll down for more)"}
      </div>
    </div>
  );
};
