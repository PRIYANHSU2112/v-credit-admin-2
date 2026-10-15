# V-Credit Enterprise Admin — Feature-Based Boilerplate

> **Next-Generation Device Finance, Digital License Key Distribution & MDM Operations Console**  
> Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Redux Toolkit (RTK + RTK Query)**.

---

## 🌟 Architecture Highlights

1. **Feature-Based Architecture (`src/features/*`)**:
   - Each domain module is strictly isolated with its own `api/` (RTK Query endpoint injection), `pages/`, `types/`, `components/`, and `index.ts`.
   - Scalable and maintainable: new developers can work on `keys`, `loans`, or `devices` without cross-polluting modules.

2. **Enterprise Reusable Component Base (`src/components/common/*`)**:
   - `DataTable<T>`: Generic, type-safe data table with client/server sorting, multi-column search, pagination, row selection, export to CSV, and loading skeleton states.
   - `KPICard`: Rich gradient metrics card with percentage trend pills, icons, and glow accents.
   - `StatusBadge`: Universal status resolver mapping device, loan, key, and partner states to standardized badges with live pulsing indicators.
   - `FilterBar`: Modular toolbar with debounced search, dropdown select filters, and reset triggers.
   - `ConfirmModal`: Reusable modal for destructive/critical operations (Device Lock, Key Reclaim, Data Wipe).
   - `SearchInput`: Debounced search input with clear icon.
   - `PageHeader`: Standardized page header with breadcrumb trail, title, subtitle, and action buttons.
   - `Modal`: Accessible dialog with animations, backdrop blur, and custom size classes.

3. **Centralized Redux Toolkit Query (`src/app/api/baseApi.ts`)**:
   - Single `baseApi` utilizing `fetchBaseQuery` with automatic `Authorization: Bearer <token>` injection.
   - Modular cache invalidation tags (`ALL_API_TAGS`).
   - Zero reducer bloat: features inject endpoints on-demand via `baseApi.injectEndpoints`.

4. **Multi-Tier RBAC & Partner Hierarchy**:
   - **Super Admin**: Central vault, key generation, platform-wide oversight.
   - **Stockist**: Regional partner, downstream distributor creation and inventory.
   - **Distributor**: City hub, dealer allocation, and local monitoring.
   - **Dealer**: Retail store, loan creation, IMEI assignment, and EMI collection.
   - Integrated persona switcher pill in development mode to test all roles with zero hassle.

5. **Instant Feature Generator CLI**:
   - Run `npm run gen:feature <name>` to scaffold an entire typed feature in seconds!

---

## 📁 Directory Structure

```
v-credit-new-admin/
├── public/                     # Brand logos, icons, favicon
├── scripts/
│   └── generate-feature.js     # CLI feature generator tool
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── baseApi.ts      # Central RTK Query baseApi
│   │   │   └── apiTags.ts      # Cache tag constants
│   │   ├── providers/
│   │   │   ├── AppProvider.tsx   # Redux + Theme + Sonner toast
│   │   │   └── ThemeProvider.tsx # Dark/Light theme switcher
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx     # Lazy loaded routes with Suspense
│   │   │   ├── ProtectedRoute.tsx# RBAC & Auth guard
│   │   │   └── routePaths.ts     # Typed route constants
│   │   └── store/
│   │       ├── store.ts        # configureStore with RTK Query
│   │       └── hooks.ts        # Typed useAppDispatch & useAppSelector
│   ├── components/
│   │   ├── common/             # Reusable business components
│   │   │   ├── DataTable/
│   │   │   ├── KPICard/
│   │   │   ├── StatusBadge/
│   │   │   ├── ConfirmModal/
│   │   │   ├── FilterBar/
│   │   │   ├── SearchInput/
│   │   │   ├── EmptyState/
│   │   │   └── PageLoader/
│   │   ├── layout/             # Shell layout components
│   │   │   ├── AppLayout.tsx   # Layout container (Sidebar + Topbar)
│   │   │   ├── Sidebar.tsx     # Role-aware collapsible sidebar
│   │   │   ├── Topbar.tsx      # Header with role switcher & theme toggle
│   │   │   └── PageHeader.tsx  # Standardized page title & actions
│   │   └── ui/                 # Atomic UI primitives
│   │       ├── Button.tsx      # Variants: primary, gradient, destructive, outline
│   │       ├── Input.tsx       # With icons, error states, helper text
│   │       ├── Card.tsx        # Card, CardHeader, CardContent
│   │       ├── Badge.tsx       # Pre-styled status badges
│   │       ├── Modal.tsx       # Accessible dialog modal
│   │       ├── Skeleton.tsx    # Shimmer loaders
│   │       └── Switch.tsx      # Toggle switch
│   ├── config/
│   │   ├── app.config.ts       # App name, versions, storage keys
│   │   ├── navigation.config.ts# Navigation definitions with permissions
│   │   └── permissions.ts      # Central RBAC capability matrix
│   ├── features/               # Domain-Driven Feature Modules
│   │   ├── auth/               # Single login page & demo credentials
│   │   ├── dashboard/          # Executive KPIs, Recharts velocity charts
│   │   ├── keys/               # Key inventory, batch generation, transfer
│   │   ├── partners/           # Partner hierarchy (Stockist, Dist, Dealer)
│   │   ├── devices/            # Financed devices, MDM lock/unlock commands
│   │   ├── loans/              # EMI schedules, repayments & overdue tracking
│   │   ├── customers/          # Borrower profiles and KYC records
│   │   ├── finance/            # Ledger & commission settlements
│   │   ├── audit/              # Immutable audit trail
│   │   └── settings/           # Policy & SMS gateway controls
│   ├── hooks/                  # Global hooks (useDebounce, usePermission)
│   ├── lib/                    # Formatters (INR, dates, IMEIs) & storage
│   ├── types/                  # Global common & user types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Tailwind CSS & design variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Start Development Server
```bash
cd v-credit-new-admin
npm run dev
```

### 2. Available Test Personas (On Login Screen)
Click any of the quick persona cards to prefill credentials:
- **Super Admin**: `admin@vcredit.in` (Platform Owner · Full Access)
- **Stockist**: `stockist.north@vcredit.in` (Regional Key Distribution)
- **Distributor**: `delhi.dist@vcredit.in` (City Hub)
- **Dealer**: `metro.telecom@vcredit.in` (Retail Store · Customer EMIs)

### 3. Generate a New Feature in 1 Second
```bash
npm run gen:feature warranties
```
This automatically scaffolds:
- `src/features/warranties/types/index.ts`
- `src/features/warranties/api/warrantiesApi.ts` (RTK Query endpoint)
- `src/features/warranties/pages/WarrantiesPage.tsx` (Pre-configured with `PageHeader`, `DataTable`, `FilterBar`, and `StatusBadge`)
- `src/features/warranties/index.ts` (Barrel export)

---

## 🛠 Reusable Component Examples

### Reusable DataTable
```tsx
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'

const columns: ColumnDef<MyItem>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
  { id: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
]

<DataTable
  data={items}
  columns={columns}
  exportable
  exportFilename="records.csv"
  pageSize={10}
/>
```

### Reusable KPICard
```tsx
import { KPICard } from '@/components/common/KPICard/KPICard'
import { KeyRound } from 'lucide-react'

<KPICard
  title="Active Keys"
  value="16,250"
  change={24.8}
  icon={KeyRound}
  variant="indigo"
  subtitle="Keys in orbit"
/>
```

### Reusable ConfirmModal
```tsx
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleLock}
  title="Lock Financed Device?"
  variant="danger"
  confirmText="Broadcast Lock"
  message="This will lock the borrower's device immediately."
/>
```
