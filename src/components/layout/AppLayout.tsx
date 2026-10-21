import { useState, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { TopProgressBar } from '@/components/common/TopProgressBar'
import { AddDistributorModal } from '@/components/common/AddDistributorModal'
import { AgreementModal } from '@/components/common/AgreementModal'

export function AppLayout() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddDistributorOpen, setIsAddDistributorOpen] = useState(false)
  const [isAgreementOpen, setIsAgreementOpen] = useState(false)

  // Determine section title and subtitle dynamically from path
  const { title, subtitle } = useMemo(() => {
    const path = location.pathname
    if (path.includes('/dashboard') || path.includes('/overview') || path === '/app') {
      return { title: 'Dashboard', subtitle: 'HOMES · OVERVIEW' }
    }
    if (path.includes('/analytics')) {
      return { title: 'Analytics', subtitle: 'OVERVIEW · TELEMETRY' }
    }
    if (path.includes('/stockists')) {
      return { title: 'Stockists', subtitle: 'DISTRIBUTION NETWORK · TIER-1 PARTNERS', isDashboard: false }
    }
    if (path.includes('/territories')) {
      return { title: 'Territories', subtitle: 'GEOGRAPHIC COVERAGE · REGIONS & HUBS', isDashboard: false }
    }
    if (path.includes('/keys') && !path.includes('/keys-return')) {
      return { title: 'Key Management', subtitle: 'LICENSE GENERATION · ALLOCATION', isDashboard: false }
    }
    if (path.includes('/inventory')) {
      return { title: 'License Inventory', subtitle: 'CENTRAL VAULT · STOCK QUOTAS', isDashboard: false }
    }
    if (path.includes('/commissions')) {
      return { title: 'Commissions', subtitle: 'FINANCIAL REVENUE · TIER SETTLEMENT', isDashboard: false }
    }
    if (path.includes('/audit')) {
      return { title: 'Audit Trail', subtitle: 'SECURITY & COMPLIANCE · SYSTEM LOGS', isDashboard: false }
    }
    if (path.includes('/notifications')) {
      return { title: 'Notifications & Alerts', subtitle: 'SYSTEM DISPATCH · QUOTA EVENTS', isDashboard: false }
    }
    if (path.includes('/distributors')) {
      return { title: 'Distributors', subtitle: 'PARTNERS · DISTRIBUTOR LIST', isDashboard: false }
    }
    if (path.includes('/dealers')) {
      return { title: 'Dealers', subtitle: 'PARTNERS · DEALER LIST', isDashboard: false }
    }
    if (path.includes('/edit-dealer')) {
      return { title: 'Edit Dealer', subtitle: 'PARTNERS · KYC MODIFICATION', isDashboard: false }
    }
    if (path.includes('/pending-users')) {
      return { title: 'Pending Users', subtitle: 'CUSTOMER · PENDING ENROLLMENT', isDashboard: false }
    }
    if (path.includes('/user-search')) {
      return { title: 'User Search', subtitle: 'CUSTOMER · ADVANCED QUERY', isDashboard: false }
    }
    if (path.includes('/users')) {
      return { title: 'End Users', subtitle: 'CUSTOMER · ENROLLED BORROWERS', isDashboard: false }
    }
    if (path.includes('/emi-safe')) {
      return { title: 'EMI Safe Management', subtitle: 'REPAYMENTS · INSTALLMENTS · SECURE PORTFOLIO', isDashboard: false }
    }
    if (path.includes('/device-control')) {
      return { title: 'Device Control Console', subtitle: 'MDM · REMOTE ACTIONS', isDashboard: false }
    }
    if (path.includes('/keys-return')) {
      return { title: 'Keys Return', subtitle: 'LICENSE · RETURN WORKFLOW', isDashboard: false }
    }
    if (path.includes('/reports/stockist-low-key')) {
      return { title: 'Stockist Low-Key Report', subtitle: 'INVENTORY · REGIONAL THRESHOLD ALERT', isDashboard: false }
    }
    if (path.includes('/reports/distributor-low-key')) {
      return { title: 'Distributor Low-Key Report', subtitle: 'INVENTORY · THRESHOLD ALERT', isDashboard: false }
    }
    if (path.includes('/reports/dealer-low-key')) {
      return { title: 'Dealer Low-Key Report', subtitle: 'INVENTORY · DEALER ALLOCATION', isDashboard: false }
    }
    if (path.includes('/reports/transfer')) {
      return { title: 'Key Transfer Report', subtitle: 'AUDIT · INVOICES & TRANSFERS', isDashboard: false }
    }
    if (path.includes('/reports/received-key')) {
      return { title: 'Received Key Report', subtitle: 'AUDIT · STOCK INWARD', isDashboard: false }
    }
    if (path.includes('/reports/iphone-transfer')) {
      return { title: 'iPhone Transfer Report', subtitle: 'IOS · LICENSES OUTWARD', isDashboard: false }
    }
    if (path.includes('/reports/iphone-received')) {
      return { title: 'iPhone Key Received', subtitle: 'IOS · LICENSES INWARD', isDashboard: false }
    }
    if (path.includes('/settings')) {
      return { title: 'System & Theme Settings', subtitle: 'PREFERENCES · MDM POLICIES', isDashboard: false }
    }
    if (path.includes('/agreement')) {
      return { title: 'Download Agreement', subtitle: 'LEGAL · AUTHORIZED DOCUMENTS', isDashboard: false }
    }
    return { title: 'V-Credit Console', subtitle: 'ENTERPRISE MDM', isDashboard: false }
  }, [location.pathname])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* Route Navigation Progress Bar */}
      <TopProgressBar />

      {/* Sidebar Navigation */}
      <AppSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenAgreement={() => setIsAgreementOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-background transition-colors duration-200">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AddDistributorModal
        isOpen={isAddDistributorOpen}
        onClose={() => setIsAddDistributorOpen(false)}
      />

      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
      />
    </div>
  )
}
