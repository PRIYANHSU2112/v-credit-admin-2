import React, { useState } from 'react'
import { Building2, Store, Briefcase, Key, Shield, UserPlus, CheckCircle2 } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type PartnerTier = 'stockist' | 'distributor' | 'dealer'

export default function AddDistributorPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  // Default partner tier based on actor hierarchy
  const initialTier: PartnerTier =
    role === 'distributor' ? 'dealer' :
    role === 'stockist' ? 'distributor' : 'stockist'

  const [selectedTier, setSelectedTier] = useState<PartnerTier>(initialTier)

  const [form, setForm] = useState({
    agencyName: '',
    ownerName: '',
    phone: '',
    email: '',
    city: '',
    state: 'Madhya Pradesh',
    address: '',
    gstNumber: '',
    dealerCode: '',
    parentName: user?.name || 'V-Credit Master Vault',
    initialKeys: '50',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.agencyName || !form.phone) {
      toast.error('Business/Agency name and phone number are required.')
      return
    }

    const tierTitle =
      selectedTier === 'stockist' ? 'Regional Stockist' :
      selectedTier === 'distributor' ? 'City Distributor' : 'Retail Dealer'

    toast.success(`${tierTitle} "${form.agencyName}" onboarded successfully!`, {
      description: `Entity registered under ${form.parentName}. Initial quota of ${form.initialKeys || 0} keys allocated.`,
    })

    setForm({
      agencyName: '',
      ownerName: '',
      phone: '',
      email: '',
      city: '',
      state: 'Madhya Pradesh',
      address: '',
      gstNumber: '',
      dealerCode: '',
      parentName: user?.name || 'V-Credit Master Vault',
      initialKeys: '50',
      password: '',
    })
  }

  return (
    <div className="space-y-6 max-w-3xl select-none">
      {/* Header Banner */}
      <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xs border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-foreground tracking-tight">
              Partner Network Onboarding
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enroll verified Stockists, City Distributors, or Retail Dealers into the V-Credit distribution tree.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-bold shrink-0 self-start sm:self-auto">
            <Shield className="h-3.5 w-3.5" />
            <span>Role: {role.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        {/* Tier Selector Pills (Available for Super Admin & Stockist) */}
        {role === 'super_admin' && (
          <div className="pt-6">
            <label className="text-xs font-bold text-slate-900 dark:text-foreground mb-2.5 block">
              Select Partner Tier to Onboard *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'stockist' as PartnerTier,
                  label: 'Regional Stockist',
                  desc: 'State-level bulk key buyer',
                  icon: Building2,
                },
                {
                  id: 'distributor' as PartnerTier,
                  label: 'City Distributor',
                  desc: 'District hub managing dealers',
                  icon: Briefcase,
                },
                {
                  id: 'dealer' as PartnerTier,
                  label: 'Retail Dealer',
                  desc: 'Store counter selling to borrower',
                  icon: Store,
                },
              ].map((tier) => {
                const Icon = tier.icon
                const isSelected = selectedTier === tier.id
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={cn(
                      'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('text-xs font-bold', isSelected ? 'text-foreground' : 'text-foreground/80')}>
                          {tier.label}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight">{tier.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {role === 'stockist' && (
          <div className="pt-6">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium">
              Logged in as Regional Stockist. You are onboarding a downstream <strong>City Distributor</strong> under your territory.
            </div>
          </div>
        )}

        {role === 'distributor' && (
          <div className="pt-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Logged in as City Distributor. You are onboarding a new <strong>Retail Dealer (Mobile Shop)</strong> under your account.
            </div>
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">
                {selectedTier === 'dealer' ? 'Shop / Store Name *' : 'Agency / Company Name *'}
              </label>
              <input
                type="text"
                name="agencyName"
                value={form.agencyName}
                onChange={handleChange}
                placeholder={selectedTier === 'dealer' ? 'e.g. Apex Phone Gallery' : 'e.g. Veda Telecom Hub'}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">
                {selectedTier === 'dealer' ? 'Dealer Full Name' : 'Managing Owner / Contact Person'}
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Enter proprietor name"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="partner@example.com"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Betul / Indore / Delhi"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Madhya Pradesh"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* GST Number or Dealer Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">
                {selectedTier === 'dealer' ? 'Dealer Code / Pincode' : 'GSTIN / Business Registration'}
              </label>
              <input
                type="text"
                name={selectedTier === 'dealer' ? 'dealerCode' : 'gstNumber'}
                value={selectedTier === 'dealer' ? form.dealerCode : form.gstNumber}
                onChange={handleChange}
                placeholder={selectedTier === 'dealer' ? 'e.g. 79746' : 'e.g. 23AABCU9603R1ZM'}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
              />
            </div>

            {/* Initial Allocated Key Quota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">
                Initial Key Allocation (Wallet)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="initialKeys"
                  min="0"
                  value={form.initialKeys}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border pl-9 pr-3 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Key className="h-4 w-4 text-primary absolute left-3 top-3" />
              </div>
            </div>

            {/* Parent Sponsor in Hierarchy (Derived) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">
                Parent Hierarchy Sponsor
              </label>
              <input
                type="text"
                name="parentName"
                readOnly
                value={
                  selectedTier === 'stockist' ? 'Platform Root (Super Admin)' :
                  selectedTier === 'distributor' ? (role === 'stockist' ? user?.name : 'Regional Stockist / Central') :
                  (role === 'distributor' ? user?.name : 'City Distributor')
                }
                className="w-full h-10 rounded-xl border border-border px-3.5 text-xs bg-muted/60 text-muted-foreground font-semibold cursor-not-allowed select-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">Business Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter registered physical office / shop address"
                rows={2}
                className="w-full rounded-xl border border-slate-300 dark:border-border px-3.5 py-2 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-900 dark:text-foreground">Login Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Set secure password for partner portal access"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-xs bg-white dark:bg-background text-slate-900 dark:text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              className="btn-action-primary font-bold px-8 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>
                Register {selectedTier === 'stockist' ? 'Stockist' : selectedTier === 'distributor' ? 'Distributor' : 'Dealer'}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setForm({
                  agencyName: '',
                  ownerName: '',
                  phone: '',
                  email: '',
                  city: '',
                  state: 'Madhya Pradesh',
                  address: '',
                  gstNumber: '',
                  dealerCode: '',
                  parentName: user?.name || 'V-Credit Master Vault',
                  initialKeys: '50',
                  password: '',
                })
              }
              className="px-6 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
