import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ROUTE_PATHS } from './routePaths'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageLoader } from '@/components/common/PageLoader/PageLoader'

// ─── Lazy-loaded Pages (Industry Standard Naming) ─────────────────────────────

// Auth
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

// Dashboard
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AnalyticsPage = lazy(() => import('@/features/dashboard/pages/AnalyticsPage'))

// Partner Hierarchy (User List)
const PartnersPage = lazy(() => import('@/features/partners/pages/PartnersPage'))
const DistributorsPage = lazy(() => import('@/features/partners/pages/DistributorsPage'))
const DealersPage = lazy(() => import('@/features/partners/pages/DealersPage'))
const EditDealerPage = lazy(() => import('@/features/partners/pages/EditDealerPage'))
const UsersPage = lazy(() => import('@/features/customers/pages/UsersPage'))
const PendingUsersPage = lazy(() => import('@/features/customers/pages/PendingUsersPage'))
const UserSearchPage = lazy(() => import('@/features/customers/pages/UserSearchPage'))

// Device Control (EMI SAFE)
const DeviceControlPage = lazy(() => import('@/features/devices/pages/DeviceControlPage'))

// Key Operations
const KeysReturnPage = lazy(() => import('@/features/keys/pages/KeysReturnPage'))
const KeysPage = lazy(() => import('@/features/keys/pages/KeysPage'))

// Customers & Finance
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'))
const LoansPage = lazy(() => import('@/features/loans/pages/LoansPage'))
const DevicesPage = lazy(() => import('@/features/devices/pages/DevicesPage'))
const FinancePage = lazy(() => import('@/features/finance/pages/FinancePage'))

// Reports
const DistributorLowKeyReportPage = lazy(
  () => import('@/features/reports/pages/DistributorLowKeyReportPage')
)
const DealerLowKeyReportPage = lazy(
  () => import('@/features/reports/pages/DealerLowKeyReportPage')
)
const TransferReportPage = lazy(
  () => import('@/features/reports/pages/TransferReportPage')
)
const ReceivedKeyReportPage = lazy(
  () => import('@/features/reports/pages/ReceivedKeyReportPage')
)
const IphoneTransferReportPage = lazy(
  () => import('@/features/reports/pages/IphoneTransferReportPage')
)
const IphoneReceivedReportPage = lazy(
  () => import('@/features/reports/pages/IphoneReceivedReportPage')
)

// Actions
const AddDistributorPage = lazy(() => import('@/features/partners/pages/AddDistributorPage'))

// Settings
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const KeyPriceSettingPage = lazy(() => import('@/features/settings/pages/KeyPriceSettingPage'))
const IphoneKeyPriceSettingPage = lazy(
  () => import('@/features/settings/pages/IphoneKeyPriceSettingPage')
)
const DownloadAgreementPage = lazy(() => import('@/features/settings/pages/DownloadAgreementPage'))

// System
const AuditPage = lazy(() => import('@/features/audit/pages/AuditPage'))

// ─── Loader wrapper ───────────────────────────────────────────────────────────
function SL({ msg, children }: { msg: string; children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader message={msg} />}>{children}</Suspense>
}

// ─── Router ──────────────────────────────────────────────────────────────────
export function AppRoutes() {
  const router = createBrowserRouter([
    {
      path: ROUTE_PATHS.LOGIN,
      element: (
        <SL msg="Loading login...">
          <LoginPage />
        </SL>
      ),
    },
    {
      path: ROUTE_PATHS.APP,
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={ROUTE_PATHS.OVERVIEW} replace />,
        },
        // ── Dashboard ──────────────────────────────────────────────────────
        {
          path: ROUTE_PATHS.OVERVIEW,
          element: (
            <SL msg="Loading dashboard...">
              <DashboardPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.ANALYTICS,
          element: (
            <SL msg="Loading analytics...">
              <AnalyticsPage />
            </SL>
          ),
        },
        // ── Partner Hierarchy (User List) ──────────────────────────────────
        {
          path: ROUTE_PATHS.PARTNERS,
          element: (
            <SL msg="Loading partner network...">
              <PartnersPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.DISTRIBUTORS,
          element: (
            <SL msg="Loading distributors...">
              <DistributorsPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.DEALERS,
          element: (
            <SL msg="Loading dealers...">
              <DealersPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.EDIT_DEALER,
          element: (
            <SL msg="Loading edit dealer...">
              <EditDealerPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.USERS,
          element: (
            <SL msg="Loading users...">
              <UsersPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.PENDING_USERS,
          element: (
            <SL msg="Loading pending users...">
              <PendingUsersPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.USER_SEARCH,
          element: (
            <SL msg="Loading user search...">
              <UserSearchPage />
            </SL>
          ),
        },
        // ── Device Control (EMI SAFE) ──────────────────────────────────────
        {
          path: ROUTE_PATHS.DEVICE_CONTROL,
          element: (
            <SL msg="Loading EMI SAFE device control...">
              <DeviceControlPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.DEVICE_CONTROL_GENERIC,
          element: (
            <SL msg="Loading EMI SAFE device control...">
              <DeviceControlPage />
            </SL>
          ),
        },
        // ── Keys Return ────────────────────────────────────────────────────
        {
          path: ROUTE_PATHS.KEYS_RETURN,
          element: (
            <SL msg="Loading keys return...">
              <KeysReturnPage />
            </SL>
          ),
        },
        // ── Core Modules ───────────────────────────────────────────────────
        {
          path: ROUTE_PATHS.CUSTOMERS,
          element: (
            <SL msg="Loading customers...">
              <CustomersPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.LOANS,
          element: (
            <SL msg="Loading loans...">
              <LoansPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.DEVICES,
          element: (
            <SL msg="Loading devices...">
              <DevicesPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.KEYS,
          element: (
            <SL msg="Loading license keys...">
              <KeysPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.FINANCE,
          element: (
            <SL msg="Loading financials...">
              <FinancePage />
            </SL>
          ),
        },
        // ── Reports Sub-Menu ───────────────────────────────────────────────
        {
          path: ROUTE_PATHS.REPORTS,
          element: <Navigate to={ROUTE_PATHS.REPORT_DISTRIBUTOR_LOW_KEY} replace />,
        },
        {
          path: ROUTE_PATHS.REPORT_DISTRIBUTOR_LOW_KEY,
          element: (
            <SL msg="Loading distributor report...">
              <DistributorLowKeyReportPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.REPORT_DEALER_LOW_KEY,
          element: (
            <SL msg="Loading dealer report...">
              <DealerLowKeyReportPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.REPORT_TRANSFER,
          element: (
            <SL msg="Loading transfer report...">
              <TransferReportPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.REPORT_RECEIVED_KEY,
          element: (
            <SL msg="Loading received key report...">
              <ReceivedKeyReportPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.REPORT_IPHONE_TRANSFER,
          element: (
            <SL msg="Loading iPhone transfer report...">
              <IphoneTransferReportPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.REPORT_IPHONE_RECEIVED,
          element: (
            <SL msg="Loading iPhone received report...">
              <IphoneReceivedReportPage />
            </SL>
          ),
        },
        // ── Settings Sub-Menu ──────────────────────────────────────────────
        {
          path: ROUTE_PATHS.SETTINGS,
          element: (
            <SL msg="Loading settings...">
              <SettingsPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.SETTING_KEY_PRICE,
          element: (
            <SL msg="Loading key price settings...">
              <KeyPriceSettingPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.SETTING_IPHONE_KEY_PRICE,
          element: (
            <SL msg="Loading iPhone key price settings...">
              <IphoneKeyPriceSettingPage />
            </SL>
          ),
        },
        // ── Actions ────────────────────────────────────────────────────────
        {
          path: ROUTE_PATHS.ADD_PARTNER,
          element: (
            <SL msg="Loading partner onboarding...">
              <AddDistributorPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.ADD_DISTRIBUTOR,
          element: (
            <SL msg="Loading add distributor...">
              <AddDistributorPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.ADD_DEALER,
          element: (
            <SL msg="Loading add dealer...">
              <AddDistributorPage />
            </SL>
          ),
        },
        {
          path: ROUTE_PATHS.DOWNLOAD_AGREEMENT,
          element: (
            <SL msg="Loading agreements...">
              <DownloadAgreementPage />
            </SL>
          ),
        },
        // ── System ─────────────────────────────────────────────────────────
        {
          path: ROUTE_PATHS.AUDIT,
          element: (
            <SL msg="Loading audit trail...">
              <AuditPage />
            </SL>
          ),
        },
      ],
    },
    {
      path: '/',
      element: <Navigate to={ROUTE_PATHS.OVERVIEW} replace />,
    },
    {
      path: '*',
      element: <Navigate to={ROUTE_PATHS.OVERVIEW} replace />,
    },
  ])

  return <RouterProvider router={router} />
}
