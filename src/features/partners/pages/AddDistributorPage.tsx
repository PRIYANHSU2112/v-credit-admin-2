import React, { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  Store,
  Briefcase,
  Shield,
  UserPlus,
  CheckCircle2,
  Upload,
  Loader2,
} from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useCreateStockistMutation,
  useCreateDistributorMutation,
  useCreateDealerMutation,
} from '@/features/partners/api/partnersApi'
import { useGetStatesQuery, useUploadFileMutation } from '@/features/common/api/masterDataApi'
import type { CreatePartnerRequest } from '@/features/partners/types'

type PartnerTier = 'stockist' | 'distributor' | 'dealer'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
]

export default function AddDistributorPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  // Default partner tier dynamically reacting to active actor role
  const getInitialTier = (): PartnerTier => {
    if (role === 'distributor') return 'dealer'
    if (role === 'stockist') return 'distributor'
    return 'distributor'
  }

  const { data: serverStates } = useGetStatesQuery()
  const [uploadFile] = useUploadFileMutation()

  const stateOptions = useMemo<string[]>(() => {
    if (serverStates && serverStates.length > 0) {
      const list = serverStates.map((s: any) => s.stateName || s.name || '').filter(Boolean)
      if (list.length > 0) return list
    }
    return INDIAN_STATES
  }, [serverStates])

  const [selectedTier, setSelectedTier] = useState<PartnerTier>(getInitialTier)

  // Form State strictly matching user field specification
  const [form, setForm] = useState({
    distributorName: '',
    phone: '',
    email: '',
    password: '',
    agencyName: '',
    gstNumber: '',
    address: '',
    state: '',
    city: '',
    district: '',
    pincode: '',
  })

  // Synchronize tier defaults when user switches roles
  useEffect(() => {
    if (role === 'distributor') {
      setSelectedTier('dealer')
    } else if (role === 'stockist') {
      setSelectedTier('distributor')
    } else {
      setSelectedTier('distributor')
    }
  }, [role])

  // File Uploads State
  const [files, setFiles] = useState<{
    profileImage: File | null
    document1: File | null
    document2: File | null
    document3: File | null
  }>({
    profileImage: null,
    document1: null,
    document2: null,
    document3: null,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (
    field: 'profileImage' | 'document1' | 'document2' | 'document3',
    file: File | null
  ) => {
    setFiles((prev) => ({ ...prev, [field]: file }))
    if (file) {
      toast.success(`Selected file for ${field}: ${file.name}`)
    }
  }

  const handleReset = () => {
    setForm({
      distributorName: '',
      phone: '',
      email: '',
      password: '',
      agencyName: '',
      gstNumber: '',
      address: '',
      state: '',
      city: '',
      district: '',
      pincode: '',
    })
    setFiles({
      profileImage: null,
      document1: null,
      document2: null,
      document3: null,
    })
    toast.info('Form cleared')
  }

  const [createStockist, { isLoading: isCreatingStockist }] = useCreateStockistMutation()
  const [createDistributor, { isLoading: isCreatingDistributor }] = useCreateDistributorMutation()
  const [createDealer, { isLoading: isCreatingDealer }] = useCreateDealerMutation()

  const isSubmitting = isCreatingStockist || isCreatingDistributor || isCreatingDealer

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!form.distributorName.trim()) {
      toast.error('Partner / Owner Name is required.')
      return
    }

    if (!form.phone.trim()) {
      toast.error('Phone Number is required.')
      return
    }

    // Backend validation: phone exactly 10 digits
    const cleanedPhone = form.phone.replace(/\D/g, '')
    if (cleanedPhone.length !== 10) {
      toast.error('Mobile number must be exactly 10 numeric digits.')
      return
    }

    if (!form.agencyName.trim()) {
      toast.error('Agency / Company / Firm Name is required.')
      return
    }

    if (!form.email.trim()) {
      toast.error('Email address is required for portal access.')
      return
    }

    // Backend validation: password min 6 chars if provided
    if (form.password && form.password.length < 6) {
      toast.error('Create Password must be at least 6 characters.')
      return
    }

    const payload: CreatePartnerRequest = {
      name: form.distributorName.trim(),
      agencyName: form.agencyName.trim(),
      phone: cleanedPhone,
      email: form.email.trim(),
      password: form.password || 'Emi@123',
      gstNumber: form.gstNumber.trim().toUpperCase(),
      gst: form.gstNumber.trim().toUpperCase(),
      address: form.address.trim(),
      state: form.state,
      territory: form.state,
      city: form.city.trim(),
      district: form.district.trim(),
      pincode: form.pincode.trim(),
      status: 'Active',
    }

    try {
      let uploadedProfileUrl = ''
      if (files.profileImage) {
        try {
          const fd = new FormData()
          fd.append('file', files.profileImage)
          const uploadRes = await uploadFile(fd).unwrap()
          if (uploadRes?.filePath) {
            uploadedProfileUrl = uploadRes.filePath
          }
        } catch (uploadErr) {
          console.warn('Profile image upload failed, proceeding with registration:', uploadErr)
        }
      }

      const finalPayload: CreatePartnerRequest = {
        ...payload,
        ...(uploadedProfileUrl ? { profileUrl: uploadedProfileUrl } : {}),
      }

      let res: any
      if (selectedTier === 'stockist') {
        res = await createStockist(finalPayload).unwrap()
      } else if (selectedTier === 'distributor') {
        res = await createDistributor(finalPayload).unwrap()
      } else {
        res = await createDealer(finalPayload).unwrap()
      }

      const tierTitle =
        selectedTier === 'stockist' ? 'Regional Stockist' :
        selectedTier === 'distributor' ? 'Distributor' : 'Dealer'

      const assignedCode = res?.data?.id || res?.data?.entityCode || 'Registered'

      toast.success(`${tierTitle} "${form.agencyName}" onboarded successfully!`, {
        description: `Code: ${assignedCode} created in database.`,
      })

      handleReset()
    } catch (err: any) {
      console.error('Failed to onboard partner:', err)
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        'Error connecting to API on port 3005. Please check backend server.'
      toast.error(errorMsg)
    }
  }

  const pageHeading =
    selectedTier === 'stockist' ? 'Create New Stockist' :
    selectedTier === 'dealer' ? 'Create New Dealer' : 'Create New Distributor'

  const nameFieldLabel =
    selectedTier === 'stockist' ? 'Stockist Name' :
    selectedTier === 'dealer' ? 'Dealer Name' : 'Distributor Name'

  const namePlaceholder =
    selectedTier === 'stockist' ? 'Enter Stockist Name' :
    selectedTier === 'dealer' ? 'Enter Dealer Name' : 'Enter Dist. Name'

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header Banner */}
      <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-xs border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-foreground tracking-tight">
              {pageHeading}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enroll verified Stockists, City Distributors, or Retail Dealers into the V-Credit distribution tree.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-bold shrink-0 self-start sm:self-auto">
            <Shield className="h-3.5 w-3.5" />
            <span>Active Persona: {user?.name || role.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        {/* Tier Selector for Super Admin (All 3 tiers) */}
        {role === 'super_admin' && (
          <div className="pt-6">
            <label className="text-xs font-bold text-slate-900 dark:text-foreground mb-2.5 block">
              Select Partner Tier to Onboard *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'stockist' as PartnerTier,
                  label: 'Regional Stockist',
                  desc: 'State-level bulk key buyer & regional supply hub',
                  icon: Building2,
                },
                {
                  id: 'distributor' as PartnerTier,
                  label: 'City Distributor',
                  desc: 'District hub managing retail shop networks',
                  icon: Briefcase,
                },
                {
                  id: 'dealer' as PartnerTier,
                  label: 'Retail Dealer',
                  desc: 'Store counter selling directly to borrower',
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
                      'flex flex-col items-start p-4 rounded-2xl border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('text-xs font-bold', isSelected ? 'text-foreground' : 'text-foreground/80')}>
                          {tier.label}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-tight">{tier.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tier Selector for Stockist (Can onboard Distributor or Dealer) */}
        {role === 'stockist' && (
          <div className="pt-6">
            <div className="p-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center justify-between">
              <span>Logged in as Regional Stockist: <strong>{user?.name || 'Music Beats'}</strong>.</span>
              <span className="text-[11px] font-semibold">Select tier below to expand your territory</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'distributor' as PartnerTier,
                  label: 'City Distributor',
                  desc: 'City warehouse or distribution hub under your regional vault',
                  icon: Briefcase,
                },
                {
                  id: 'dealer' as PartnerTier,
                  label: 'Direct Retail Dealer',
                  desc: 'Authorize a store directly under your regional stock',
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
                      'flex flex-col items-start p-4 rounded-2xl border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('text-sm font-bold', isSelected ? 'text-foreground' : 'text-foreground/80')}>
                          {tier.label}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Banner for Distributor (Locked to Onboarding Dealers) */}
        {role === 'distributor' && (
          <div className="pt-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-3">
              <Store className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-foreground">
                  Logged in as City Distributor: <span className="text-emerald-600 dark:text-emerald-400">{user?.name || 'VEDA ENTERPRISE'}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You are enrolling an authorized retail store (Dealer Counter) into your city distribution network.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Form spanning full width without right-side blank space */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Section 1: Partner & Contact Details (3 Balanced Columns) */}
          <div className="bg-muted/20 p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              1. Business & Identity Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Distributor Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  {nameFieldLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="distributorName"
                  value={form.distributorName}
                  onChange={handleChange}
                  placeholder={namePlaceholder}
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  required
                />
              </div>

              {/* 2. Agency Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Agency Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="agencyName"
                  value={form.agencyName}
                  onChange={handleChange}
                  placeholder="Agency / Company / Firm Name"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  required
                />
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  required
                />
              </div>

              {/* 4. Email Id */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Email Id <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email@gmail.com"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* 5. Create Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* 6. Gst Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Gst Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="Gst Number"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                />
              </div>

              {/* 7. Address (Spanning 2 columns on desktop) */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 dark:border-border px-3.5 py-2 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  required
                />
              </div>

              {/* 8. Profile Image (Taking 3rd column on desktop) */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Profile Image
                </label>
                <div className="flex flex-col justify-center h-[54px] rounded-xl border border-dashed border-border px-3 bg-card/60">
                  <div className="flex items-center gap-2.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0 shadow-2xs">
                      <Upload className="h-3 w-3 text-primary" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('profileImage', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted-foreground truncate font-mono">
                      {files.profileImage ? files.profileImage.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Geographical & Location Details (4 Even Columns) */}
          <div className="bg-muted/20 p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              2. Territory & Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 9. State */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                  required
                >
                  <option value="">Select State</option>
                  {stateOptions.map((st: string) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10. City */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  required
                />
              </div>

              {/* 11. District */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Enter District"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 12. Pincode */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter Pincode"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-border px-3.5 text-sm bg-white dark:bg-background text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verification KYC Documents (3 Columns) */}
          <div className="bg-muted/20 p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              3. Verification KYC Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 13. Document 1 */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Document 1
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0 shadow-2xs">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('document1', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground truncate font-mono">
                    {files.document1 ? files.document1.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* 14. Document 2 */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Document 2
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0 shadow-2xs">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('document2', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground truncate font-mono">
                    {files.document2 ? files.document2.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* 15. Document 3 */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-foreground">
                  Document 3
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0 shadow-2xs">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('document3', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground truncate font-mono">
                    {files.document3 ? files.document3.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary font-bold px-8 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Enrolling {selectedTier === 'stockist' ? 'Stockist' : selectedTier === 'distributor' ? 'Distributor' : 'Dealer'}...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>
                    Register {selectedTier === 'stockist' ? 'Stockist' : selectedTier === 'distributor' ? 'Distributor' : 'Dealer'}
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
