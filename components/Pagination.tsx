"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  itemOffset: number;
  currentItems: any[];
  pageCount: number;
  totalRecords: number;
  handlePageClick: ({ selected }: { selected: number }) => void;
  currentPage: number;
  perPage: number;
  handlePerPage?: (e: any) => void;
  isFetching: boolean;
  selectOptions?: number[];
}

export function Pagination({
  itemOffset,
  currentItems,
  pageCount,
  totalRecords,
  handlePageClick,
  currentPage,
  perPage,
  handlePerPage,
  isFetching,
  selectOptions = [10, 20, 50, 100],
}: PaginationProps) {
  if (isFetching || !totalRecords || !currentItems?.length) return null;

  return (
    <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-3">
        <select
          value={perPage}
          onChange={handlePerPage}
          className="h-8 w-16 rounded-md border bg-background px-1 text-xs outline-none"
        >
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="hidden text-sm sm:block">
          Showing {1 + itemOffset} to{" "}
          {Math.min(itemOffset + currentItems.length, totalRecords)} of{" "}
          {totalRecords}
        </p>
      </div>

      <ReactPaginate
        breakLabel="..."
        nextLabel={
          <ChevronRight className="size-4" />
        }
        previousLabel={
          <ChevronLeft className="size-4" />
        }
        onPageChange={handlePageClick}
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        pageCount={pageCount}
        forcePage={currentPage}
        renderOnZeroPageCount={null}
        className="flex items-center gap-0.5"
        pageLinkClassName="flex size-8 items-center justify-center rounded-md text-xs transition-colors hover:bg-muted"
        activeLinkClassName="!bg-foreground !text-background"
        previousLinkClassName="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
        nextLinkClassName="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
        disabledLinkClassName="pointer-events-none opacity-30"
        breakLinkClassName="flex size-8 items-center justify-center text-xs"
      />
    </div>
  );
}
