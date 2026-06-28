# X-Noname Component Library & Conventions

> **Rule**: Before creating any new component or page, read this document. Every pattern worth extracting has already been extracted.

---

## 1. Core Principles

- **Reuse before create** — always extend an existing component with props before building new. Only create new if existing truly cannot work.
- **Never break existing consumers** — new props must have defaults that preserve current behavior.
- **300-line max** per component/page file. Exceed it? Split into `_components/` folder.
- **No `font-mono` on data** — only for raw code output (JSON, code snippets). Account numbers, refs, IDs are normal `text-sm text-foreground`.
- **No shadows or backdrop blur** — flat design only.
- **Icons only when they communicate** — no decorative icons. Sidebar nav = allowed (scanning aid). Status badges = required (redundant cues). Buttons = only if icon clarifies action.

---

## 2. Page Structure

Every page follows this layout:

```tsx
// 1. PageHeader at the top
<PageHeader title="Page Title" description="Brief description" />

// 2. Data fetching with AsyncContent
<AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="...">
  // content
</AsyncContent>

// 3. DataTable for lists (handles loading/error/empty internally)
<DataTable columns={columns} data={items} ... />

// 4. DetailSheet for detail views
<DetailSheet open={open} onOpenChange={setOpen} title="..." isLoading={loading} isError={error} onRetry={refetch}>
  // detail content with DetailRow components
</DetailSheet>
```

### Page header pattern:
```tsx
import { PageHeader } from "@/components/PageHeader";
<PageHeader title="Transactions" description="View and manage all your transactions" />
```

---

## 3. Reusable Components

### `PageHeader` — `@/components/PageHeader`
```tsx
<PageHeader title="Page Title" description="Optional description" />
```
Renders `text-xl font-medium text-foreground` title + `text-sm text-muted-foreground` description.

### `SectionHeader` — `@/components/SectionHeader`
```tsx
<SectionHeader title="Section" description="Optional" action={<Button>Action</Button>} />
```
For tab sections inside settings pages. Has an optional `action` slot for buttons.

### `AsyncContent` — `@/components/AsyncContent`
```tsx
<AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="...">
  {children}
</AsyncContent>
```
Handles `isPending` → LoadingState, `isError` → ErrorState, else renders children. Replaces manual loading/error gates.

### `DataTable` — `@/components/DataTable`
```tsx
import { DataTable, type Column } from "@/components/DataTable";

const columns: Column<MyType>[] = [
  // Use column helpers wherever possible
];

<DataTable
  columns={columns}
  data={items}
  isPending={isPending}
  isError={isError}
  onRetry={refetch}
  errorMessage="..."
  emptyTitle="No items"
  emptyDescription="Create one to get started"
  pageCount={data?.data?.totalPages}
  currentPage={page}
  perPage={size}
  totalRecords={data?.data?.totalRecords}
  itemOffset={page * size}
  onPageChange={(s) => setPage(s)}
  onPerPageChange={(s) => { setSize(s); setPage(0); }}
  isFetching={isFetching}
  onRowClick={(item) => ...}
/>
```
Always renders table headers. Never uses `?? []` for data — let `undefined` signal "not loaded."

### `DetailSheet` — `@/components/DetailSheet`
```tsx
<DetailSheet open={open} onOpenChange={setOpen} title="Details" isLoading={loading} isError={isError} onRetry={refetch} errorMessage="...">
  <DetailRow label="Field" value={value} />
</DetailSheet>
```
Handles loading/error/data states. Use `DetailRow` for label/value pairs inside.

### `DetailRow` — `@/components/DetailRow`
```tsx
<DetailRow label="Reference" value={item.reference} />
<DetailRow label="Status" value={<StatusBadge status={item.status} />} />
<DetailRow label="Amount" value={formatMoney(item.amount)} />
```
Renders `label` as `text-xs text-muted-foreground` and `value` as `text-sm font-medium`. Props: `mono` (adds `font-mono`), `capitalize`, `className`.

### `FilterModal` — `@/components/FilterModal`
```tsx
<FilterModal open={open} onOpenChange={setOpen} onApply={() => syncFilters()} onClear={() => clearFilters()}>
  <Select value={localValue} onValueChange={setLocalValue}>...</Select>
  <DatePicker ... />
</FilterModal>
```
Standard filter modal with Apply/Clear buttons. Uses local state + syncs on Apply.

### `TableActions` — `@/components/TableActions`
```tsx
<TableActions actions={[
  { label: "Edit", onClick: () => edit(item) },
  { label: "Delete", onClick: () => delete(item), destructive: true },
]} />
```
Renders a vertical three-dots kebab menu using shadcn DropdownMenu.

### `StatusBadge` — `@/components/StatusBadge`
```tsx
<StatusBadge status={item.status} size="sm" />
```
Maps status to icon + color. Always use instead of manual status styling.

### `ConfirmDialog` — `@/components/ConfirmDialog`
```tsx
<ConfirmDialog
  open={!!targetId}
  onOpenChange={(open) => { if (!open) setTargetId(null); }}
  title="Delete Item"
  description="Are you sure?"
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={handleDelete}
  loading={isDeleting}
/>
```

### `SearchInput` — `@/components/SearchInput`
```tsx
<SearchInput value={search} onChange={setSearch} onSearch={handleSearch} onClear={handleClear} showClear={!!search} placeholder="Search..." />
```
Input + Search button, both `h-10`. Matches button height.

### `DatePicker` — `@/components/DatePicker`
```tsx
<DatePicker value={dateValue} onChange={(d) => setDateValue(d)} label="Start Date" maxDate={someDate} minDate={someDate} />
```
Uses shadcn Calendar + Popover. Future dates are disabled. Accepts `maxDate`/`minDate` for range validation.

### `DateDisplay` — (planned) renders date as "21st June 2026" on line 1, time on line 2.

### `BankAccountDisplay` — (planned) renders "0123456789 • Bank Name" on line 1, "Account Name" on line 2.

### `ColumnHelpers` — `@/components/ColumnHelpers`
```tsx
import { referenceColumn, amountColumn, statusColumn, dateColumn, actionsColumn } from "@/components/ColumnHelpers";

const columns: Column<MyType>[] = [
  referenceColumn((item) => item.reference),
  amountColumn((item) => item.amount),
  statusColumn((item) => item.status),
  dateColumn((item) => item.createdAt),
  actionsColumn((item) => <TableActions actions={[...]} />),
  // Custom columns for unique patterns:
  { key: "name", header: "Name", cell: (item) => <span>{item.name}</span> },
];
```

### `CreateCustomerModal` — `@/components/CreateCustomerModal`
```tsx
<CreateCustomerModal open={open} onOpenChange={setOpen} onSuccess={(id) => refetchCustomers()} />
```

### `EmptyState` — `@/components/EmptyState`
```tsx
<EmptyState title="No data" description="Description" action={{ label: "Action", onClick: () => {} }} />
```

### `ErrorState` — `@/components/ErrorState`
```tsx
<ErrorState message="Failed to load" onRetry={refetch} />
```
Shows error icon + message + retry button (unless 403).

### `LoadingState` — `@/components/LoadingState`
```tsx
<LoadingState message="Loading..." />
```
Spinner with optional message. No more skeletons.

### `Suspense Wrapper` — `@/components/withSuspense`
```tsx
export default withSuspense(MyContentComponent);
```
Wraps any component in `<Suspense fallback={<LoadingState />}>`. Required for pages using `nuqs`.

---

## 4. State Management

### URL state (nuqs)
- All filter/pagination/search state uses `nuqs` (`useQueryState`).
- Tab switches reset all query params.
- Filter modals: use local state + sync on Apply.

```tsx
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
```

### UI state (React useState)
- Modal open/close, selected IDs, delete targets — plain `useState`.
- Filter modals use local state (e.g., `localStatus`) synced on Apply/Clear.

### Auth state (Context + useReducer)
- `useAuth()` from `@/contexts/auth-context` provides `user`, `merchant`, `token`, `setToken`, `setUser`, `setMerchant`, `logout`.

### Theme state (Context)
- `useTheme()` from `@/components/theme-provider` provides `theme`, `setTheme`, `resolvedTheme`.

---

## 5. Data Fetching Patterns

### Queries
```tsx
const { data, isPending, isError, error, refetch, isFetching } = useQuery({
  queryKey: ["my-data", page, size],
  queryFn: () => getMyDataFn({ page, size }),
});
```
- `isPending` for initial load gating
- `isFetching` for background refetch overlay
- `data?.data?.items` not `data.data.data`

### Mutations
```tsx
const { mutateAsync, isPending } = useMutation({
  mutationFn: myMutationFn,
  onSuccess: (data) => {
    toastMessage("success", data?.message);
    queryClient.invalidateQueries({ queryKey: ["my-data"] });
  },
  onError: (error) => {
    toastMessage("error", extractError(error));
  },
});
```
- `onSuccess`/`onError` callbacks for toasts and refetch
- Try/catch at form submit level when calling `mutateAsync`

### API service functions
```tsx
// services/queries/my-feature.ts
export const getMyDataFn = (params: { page: number; size: number }) => {
  return getData<MyResponse>("/endpoint", params);
};
```

---

## 6. Styling Conventions

### Font sizes
| Level | Class | Used for |
|---|---|---|
| Page title | `text-xl font-medium` | Top of every page |
| Section heading | `text-base font-semibold` | Card headers, section titles |
| Body | `text-sm` | Descriptions, helper text |
| Label | `text-sm font-medium` | Form labels |
| Table header | `text-xs font-medium` | Column headers |
| Table cell | `text-sm` | Data cells |
| Mono | `text-xs` | Only raw code output |

### Consistent sizes
- All buttons: default `h-10`
- All inputs: `h-10`
- Filter/icon buttons: `size-10`
- Table inline actions: `TableActions` component (kebab menu)

### Text colors
- All table text: `text-foreground` — no muted in tables
- `text-muted-foreground` only for truly secondary content (timestamps, helper text)
- No `opacity-*` on text — use correct color token

### Status badges
- Only element allowed to use different colors in tables.
- Always use `StatusBadge` component — never manual status styling.

---

## 7. DO NOTs

- **Do NOT** use `?? []` for DataTable `data` prop — let it be `undefined` so the table knows data hasn't loaded.
- **Do NOT** write manual loading/error/empty gates — use `AsyncContent`, `DataTable`, or `DetailSheet`.
- **Do NOT** write `<h1>` directly — use `<PageHeader />`.
- **Do NOT** write inline label/value divs — use `<DetailRow />`.
- **Do NOT** write inline kebab menus — use `<TableActions />`.
- **Do NOT** write inline filter modals — use `<FilterModal />`.
- **Do NOT** write custom date inputs — use `<DatePicker />`.
- **Do NOT** use `font-mono` for references, IDs, or account numbers.
- **Do NOT** create a new component if an existing one can be extended with props.
- **Do NOT** use shadows (`shadow-*`), backdrop blur (`backdrop-blur-*`), or zoom on hover.
- **Do NOT** use `text-muted-foreground` in tables — all table text is `text-foreground`.
- **Do NOT** write raw `Suspense` wrappers — use `withSuspense(Component)`.

---

## 8. What Each Component Replaces

| Component | Replaces | Lines saved |
|---|---|---|
| `PageHeader` | Hand-written `<h1>` + `<p>` in every page | ~6 per page |
| `SectionHeader` | Hand-written heading + description + action | ~5 per section |
| `AsyncContent` | Manual `if (isLoading) / if (isError)` gates | ~6 per use |
| `DetailRow` | Inline `<div><p>label</p><p>value</p></div>` | ~4 per row |
| `DetailSheet` | Manual loading/error/content in a sheet | ~15 per sheet |
| `FilterModal` | Inline filter modals with Apply/Clear | ~30 per modal |
| `TableActions` | Inline kebab menus in table rows | ~15 per table |
| `ColumnHelpers` | Repetitive column definitions | ~8 per column |
| `CreateCustomerModal` | Duplicated form in create + update invoice | ~60 total |
| `withSuspense` | Raw `<Suspense fallback={...}>` wrappers | ~5 per page |
| `StatusBadge` | Manual status color/icon logic | ~10 per table |
| `SearchInput` | Inline search with Input + Button | ~12 per page |
| `ConfirmDialog` | Hand-written confirm dialogs | ~15 per dialog |

---

## 9. Common Pitfalls

- **Flicker on data load**: Always use `isPending` (not `isFetching`) for initial loading state. Once data exists, always render it with a subtle overlay for refetches. Never replace existing data with a loading spinner.
- **Undefined errors**: Use `??` everywhere — `data?.items ?? []`, `user?.name ?? ""`. Never access nested properties without optional chaining.
- **Date formatting**: Always null-check before rendering — `date ? <DateDisplay date={date} /> : "—"`.
- **Amount formatting**: Use `formatMoney(amount)` from `@/utils`. Never write custom number formatting.
- **Pagination**: Use `nuqs` for page/size state. Reset to page 1 when filters change.
- **Hydration errors**: `defaultOpen` on `SidebarProvider` must be deterministic. Use server-side cookie reading.
