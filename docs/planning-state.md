# Planning State

## Roles

### Merchant Sidebar (8 main)
1. Home (with balances/analytics)
2. Payment Links
3. Transactions
4. Refunds
5. Customers
6. Disputes
7. Settlements
8. Developers

Settings tabs: Profile, Security, API Keys, Webhook Endpoints, Webhook Logs (WideSheet), Split Rules, Subaccounts
Team commented out.

### Admin Sidebar (8 main)
1. Home
2. Merchants
3. Settlements
4. Reconciliation
5. Refunds
6. Disputes
7. Audit Logs
8. Provider Health

Settings tabs: Webhooks, Adjustments

## Architecture Decisions

### Shared components to build
- **Timeline** - vertical chronological component for payment lifecycle
- **EvidencePack** - file upload + viewer for disputes
- **FilterBar** - reusable filter with nuqs state management
- **WideSheet** - consistent wide sheet for details/logs
- **DateDisplay** - renders date as "21st June 2026" on first line, time on second line with smaller text. Used in all tables and detail views
- **TableActions** - vertical three-dots (kebab) button using shadcn's `DropdownMenu` component. Used for all inline table row actions. Ensures consistent action placement across every table in the app
- **DocumentationButton** - link button in dashboard header that opens documentation URL in a new tab. Uses `CONFIG.DOCUMENTATION_URL` from config.ts

### Routing convention
- Merchant routes: **no prefix** — `/transactions`, `/settlements`, `/home`
- Admin routes: **`/admin` prefix** — `/admin/merchants`, `/admin/settlements`
- App Router route groups: `app/(dashboard)/` for merchant, `app/admin/(dashboard)/` for admin
- No `/merchant` prefix — merchants are the primary user, they get clean URLs

### Merchant/Admin sharing pattern
- Same component for shared pages (transactions, settlements, refunds, disputes)
- Merchant route passes `merchantId: me` from auth context
- Admin route can filter by specific merchantId or show all
- Admin-only pages get their own components (Reconciliation, AuditLogs, ProviderHealth)
- Merchant-only pages get their own (Home, PaymentLinks, Developers, Subaccounts, SplitRules)
- All filter/pagination state managed by nuqs

### New merchant pages (9)
- /settlements + /settlements/:id
- /customers + /customers/:id
- /split-rules
- /subaccounts
- /disputes + /disputes/:id
- /refunds/:id
- /developers

### New admin pages
- /admin - Home overview
- /admin/merchants + /admin/merchants/:id
- /admin/settlements + /admin/settlements/:id
- /admin/reconciliation + /admin/reconciliation/:id
- /admin/refunds
- /admin/disputes
- /admin/audit-logs

### Not pages (modals/sheets)
- Transaction detail (merchant + admin) - WideSheet
- Webhook logs - WideSheet in settings
- Admin transaction detail - modal

### Phasing
- Phases 0-3: backend only, out of frontend scope
- Frontend starts at Phase 4
- Backend is being built in parallel

### Identified gaps (not yet planned)
- Merchant payout method / settlement bank account management
- API documentation page / webhook testing tool
- Notification preferences / email alerts
- Admin role management
- Feature flags / maintenance mode
- Event/webhook simulator (admin fire test webhook)
- Bulk operations (bulk approve settlements, bulk resolve exceptions)
- Global search / transaction lookup across roles
- Reusable export pattern for all list pages
- Post-registration onboarding wizard (first key, webhook, channel setup)

### Mandatory code conventions — STRICT
These are non-negotiable. Every single file must follow these patterns.

**Data fetching (TanStack Query):**
- Queries: `useQuery` with destructured `{ data, isPending, isError, error, refetch, isFetching }`
- Mutations: `useMutation` with `onSuccess`/`onError` callbacks (not try/catch at call site for the mutation itself)
- `onSuccess`: always show success toast via `toastMessage("success", data?.message)`, then `refetch()` or `queryClient.invalidateQueries()` if needed
- `onError`: always show error via `toastMessage("error", extractError(error))` — NEVER silently swallow errors
- The `mutateAsync` pattern wrapped in try/catch is used at the FORM SUBMIT level (handleSubmit), not inside mutation callbacks
- `isPending` for initial load gating, `isFetching` for background refetch overlay
- Query keys: simple strings or arrays like `["merchant"]`, `["transactions", page, size]`

**Forms (react-hook-form + zod):**
- Every form uses `zodResolver` with `@hookform/resolvers/zod`
- `useForm` with `{ resolver: zodResolver(schema) }`
- `useFieldArray` for dynamic lists (invoice items, split recipients)
- `FormField` component wraps label + error + required indicator
- Never pass raw `register` to a non-standard component — use `watch`/`setValue` for custom components

**API calls (services/):**
- Every endpoint function in `services/queries/` follows `actionFn` naming
- Generic helpers: `getData<T>`, `postData<T>`, `patchData<T>`, `putData<T>`, `deleteData<T>`
- Error extraction: `error?.response?.data?.message ?? error?.message ?? "Something went wrong"`

**Loading, error, empty states — MANDATORY pattern for every data view:**
```tsx
if (isPending) return <LoadingState />;
if (isError) return <ErrorState message="..." onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState title="..." />;
return <ActualContent data={data} />;
```
- NEVER flicker — once data exists, always render it with overlay for refetch
- Use `data === undefined` to distinguish "never loaded" from "empty results"
- Empty state only after confirmed success with no data

**TypeScript & data safety:**
- `??` everywhere — `data?.items ?? []`, `user?.name ?? ""`, `merchant?.status ?? "—"`
- NEVER assume a value exists — optional chain EVERYTHING
- `as any` only in service/utility files, never in pages or components
- Extract types into feature-specific files under `types/`
- `BareResponse` standard: `{ message: string; status: boolean }`

**API response handling:**
- Never access `data.data.data` — use named destructuring like `const transactions = data?.data?.transactions;`
- Never use `?? []` for DataTable data props — let it be `undefined` so the table knows data hasn't loaded
- Paginated responses follow the `PaginatedResponse` shape: `totalRecords`, `totalPages`, `currentPage`, `perPage`

**State management:**
- URL-driven filter/pagination: use `nuqs` (`useQueryState`, `parseAsInteger`, `parseAsString`)
- UI-only state (modals, selections): use React `useState`
- Auth state: `AuthContext` with `useReducer` + encrypted localStorage
- Theme state: custom `ThemeProvider` with localStorage + class toggle

**Imports & file structure:**
- Barrel exports from `services/queries/index.ts`, `types/index.ts`, etc.
- Two-group imports: React/libraries first, then `@/` aliases
- Use `@/` aliases everywhere — no relative imports beyond direct siblings

**Tab switching behavior:**
- Switching tabs on the same page must reset all nuqs query params to defaults
- URL should be clean when landing on a fresh tab — no stale filters from the previous tab
- This applies to settings tabs, team (members/invites), and any future tabbed views

**Pagination & search UX:****
- Pagination component must be clean and sleek — minimal, subtle, matching the B/W aesthetic
- When a page loads with nuqs URL params (e.g. `?q=REF123&page=2`), the search input and filter modal must reflect those values immediately
- Filter modals: on open, sync local filter state from the current nuqs URL params so the user sees what's already applied
- On clear/reset, remove the params from the URL, don't just set them to empty strings

**Compact formatting for analytics:**
- Add `formatMoneyCompact` to utils — uses `Intl.NumberFormat` with `notation: "compact"` (e.g., "₦1.5M", "₦230K")
- Used in: dashboard analytics cards, overview widgets, summary stats
- Not used in: tables, detail views, exports — those use standard `formatMoney`

**Date & money formatting:******
- Always null-check dates before rendering: `date ? <DateDisplay date={date} /> : "—"`
- Never rewrite `formatMoney` or `formatNumber` — use the existing utilities in `utils/index.tsx`
- `formatMoney` and `formatMoneyWithCurrency` should accept an optional currency param, defaulting to NGN/₦ if absent
- Store/display amounts in minor units (kobo) where backend provides them, format for human display using the utilities

**Input validation rules:****
- Amount fields: prevent non-numeric input at keystroke level (`onKeyDown`/`onInput` filter), not just on submit validation. Use `handleNoAlphabetInput` or similar pattern
- Start date must never be after end date — validate both at the field level (disable invalid dates in DatePicker) and at the form level (zod `.refine()`)
- All date comparisons use `date-fns` for consistency

**Component & page size limit:****
- No component or page file may exceed 300 lines
- Extract reusable logic into custom hooks
- Extract reusable UI into shared components
- Extract large sections into sub-components in the same folder or a `_components/` directory
- Pages that exceed 300 lines must be split into a folder with `page.tsx` (importing sub-components) + individual component files

**Error handling for mutations:****
- `useMutation({ mutationFn, onSuccess, onError })` — success/error handled in callbacks
- Clear form on success: `reset()` or `setValue()`
- Optimistic updates when appropriate, always rollback on error

### Mandatory post-feature assessment
After every feature is built, run a full assessment checking:
- Unhandled edge cases (null data, empty arrays, missing fields, network errors)
- UX breaks (flickering, layout shift, missing loading/error/empty states, broken navigation)
- UI breaks (overflow, misalignment, broken dark mode, mobile responsiveness, inconsistent spacing)
- Console errors, hydration mismatches, type errors
- All states covered: loading → empty → error → success, with no flicker between transitions

### Settings page — consistent tab headers
Every settings tab (merchant + admin) must follow:
- Page header: `text-xl font-medium text-foreground`
- Tab section heading: `text-base font-semibold` with `text-sm text-muted-foreground` description
- All tabs now use `SectionHeader` component with title + description + optional action slot
- Section headers render outside loading/error/data gating
- `SectionHeader` is reusable — used in settings and will be used in admin pages too

### Font consistency — STRICT
Every text element must use exactly one of these. No exceptions.

| Level | Size | Weight | Color | Used for |
|---|---|---|---|---|
| Page title | `text-xl` | `font-semibold` | `text-foreground` | Top of every page |
| Section heading | `text-base` | `font-semibold` | `text-foreground` | Card headers, section titles |
| Card title (shadcn) | `text-base` | `font-medium` | `text-foreground` | `CardTitle` |
| Body / paragraph | `text-sm` | `font-normal` | `text-muted-foreground` | Descriptions, helper text |
| Label | `text-sm` | `font-medium` | `text-foreground` | Form labels, field names |
| Table header | `text-xs` | `font-medium` | `text-foreground` | Column headers |
| Table cell | `text-sm` | `font-normal` | `text-foreground` | Data cells |
| Mono / code | `text-xs` | `font-normal` | `text-foreground` | Only raw code output — JSON blobs, API responses, code snippets. NOT references, IDs, hashes, account numbers, transaction refs — those are normal text. |
| Error | `text-xs` | `font-normal` | `text-destructive` | Validation messages |
| Button | `text-sm` | `font-medium` | — | Inherited from variant |
| Meta | `text-xs` | `font-normal` | `text-muted-foreground` | Secondary info, timestamps (outside tables) |

### Bank account display format
When displaying bank account details in tables or lists:
- **Line 1:** Account number `text-sm` + `text-foreground` styled dot separator (`•`) + bank name `text-sm`
- **Line 2:** Account name `text-sm text-foreground`
- No `text-muted-foreground` — all three pieces are primary info for the user
- Only use `text-muted-foreground` when text is genuinely secondary to a main item (e.g., timestamps next to a primary title)
- Example:
  ```
  0123456789 • Providus Bank
  MALIMBE / ACME STORES
  ```

### Table text truncation rules
- **Truncate:** long strings that cause overflow — references, transaction IDs, long descriptions. Use `truncate` + appropriate `max-w-[px]` per column
- **Do NOT truncate:** names, email addresses, statuses, amounts, dates, account numbers — let them take natural width
- **Do NOT truncate:** names, email addresses, statuses, amounts, dates — let them take natural width
- **Exception:** on mobile, any column can be truncated or hidden if it causes overflow
- **Always set a width on columns that can be truncated** — otherwise the browser won't know when to truncate

Rules:
- Never deviate. No exceptions.
- No `opacity-*` on text — use the correct color token
- Only StatusBadge may use different colors inside tables
- `text-muted-foreground` is for secondary/auxiliary text only — timestamps, helper descriptions, meta info. Never use it on primary content like account numbers, names, amounts, references
- No mixing sizes/weights for the same semantic level within a view
- Geist Mono (`font-mono`) for all monospace — nothing else

### Keep it simple — no decoration
- **NO SHADOWS. ZERO. NONE.** Not `shadow-*`, not `drop-shadow-*`, not `ring-*` that acts as a shadow, not box-shadow. Flat design only.
- Check all shadcn components for default shadows — override them if present
- No zoom, scale, or transform on hover — no `hover:scale-*`, `hover:rotate-*`, etc.
- No border colors on cards — cards use `border` (default border color) where needed, never `border-*-*`
- No gradients on surfaces — `bg-gradient-*` only allowed on auth layout decorative panel
- No backdrop blur (`backdrop-blur-*`)
- Clean, minimal, flat — every decorative element must earn its place

### Icon philosophy — minimal
- **Avoid icons unless they communicate something text alone cannot**
- No decorative icons — every icon must earn its place by aiding comprehension
- Sidebar nav items: icons allowed (they aid scanning)
- Status badges: icons required (redundant status cues per Vercel guidelines)
- Table actions: kebab menu icon allowed
- Buttons: only use an icon if it clarifies the action (e.g., a "plus" on "Create"), never an icon alone without text
- Settings sections: icon + text is fine for navigation
- Never repeat the same meaning with both an icon and redundant text decoration

### Icon blacklist
- Never use: `Shield`, `ShieldCheck`, `ShieldAlert`, `ShieldX`, `ShieldOff`, `ShieldHalf`, or any shield variant
- Never use: `Banknote` (looks like a dollar bill)
- In formatted amounts (via `formatMoney`/`formatMoneyWithCurrency`), the ₦ symbol is acceptable as part of standard currency formatting
- Never use a standalone naira or dollar symbol outside of formatted amounts — no `<span>₦</span>`, no `naira` JSX variable
- Never use dollar (`$`), naira (`₦`, `&#8358;`), or any currency-specific icon/symbol anywhere in the app
- Use generic icons for money-related displays: `Wallet`, `CreditCard`, `CircleDollarSign`, `Receipt`, `Banknote` (note: `Banknote` visually resembles a dollar bill — avoid it too)
- Preferred money icons: `Wallet`, `CircleDollarSign`, `Landmark`, `Coins`, `Receipt`
- Currency display in text: use the currency code (e.g., "NGN 10,000") not the symbol

### Modal & sheet consistency
- Desktop: shadcn `Dialog` — centered, overlay, no backdrop blur
- Mobile: vaul `Drawer` — bottom sheet, `rounded-t-2xl`, drag handle width `w-12`, no backdrop blur
- Wide sheets (for logs, details): use `WideSheet` component (extends shadcn `Sheet` with wider default width)
- Title: `text-base font-semibold`
- Description: `text-sm text-muted-foreground`
- No custom modal sizes per-feature — use the standard `ResponsiveModal`, `ResponsiveSheet`, or `WideSheet`
- Close button always in top-right
- Content scrolls internally when long, never the page behind

### UI rules
- **No backdrop blur** (`backdrop-blur-*`) anywhere in the app — keep it clean and flat
- **Reuse before create — CRITICAL** — always check if an existing component can be extended with props before building a new one. Only create new if existing truly cannot work. This is not a suggestion, it is a hard rule. Duplicated components create inconsistent UI, more bugs, and maintenance overhead
- **Never break existing consumers** — when extending a component with new props, ensure all existing usages continue to work without changes. Default values for new props must preserve current behavior

### Consistent sizing
- All buttons: default size is `h-10` — no `size="sm"` anywhere
- All inputs: `h-10` — matches button height
- Select triggers: `h-10` — matches button height
- Search fields: `h-10` — matches button height
- Filter/icon buttons: `size-10` (not `size="icon"` which is 32px)
- The only exception is inline table action buttons which may use `h-8` or `size-8` for compactness

### Design conventions
- B/W minimal, black primary
- PP Mori font (Inter kept as fallback)
- motion/react for animations
- nuqs for all filter/pagination state
- **Vercel Web Interface Guidelines** — follow to the letter: https://vercel.com/design/guidelines
  - URL as state (nuqs) ✅
  - Loading buttons with original label ✅
  - Confirm destructive actions (ConfirmDialog) ✅
  - No dead ends, all states designed ✅
  - Redundant status cues (StatusBadge with icon + text) ✅
  - Labels everywhere ✅
  - Never disable paste ✅
  - Keyboard works everywhere, clear focus rings ✅
  - Honor prefers-reduced-motion ✅
  - Tabular numbers for comparisons (font-mono) ✅
  - Enter submits forms, textarea uses Cmd+Enter ✅
  - Don't pre-disable submit — allow submission to show validation ✅
  - Error placement next to fields, focus first error on submit
