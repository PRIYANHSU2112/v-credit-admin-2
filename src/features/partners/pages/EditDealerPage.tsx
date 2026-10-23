import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  useGetDealersQuery,
  useUpdatePartnerProfileMutation,
  useResetPartnerPasswordMutation,
} from '@/features/partners/api/partnersApi'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { toast } from 'sonner'

export default function EditDealerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: dealersRes, isLoading: isLoadingDealers } = useGetDealersQuery()
  const [updatePartnerProfile] = useUpdatePartnerProfileMutation()
  const [resetPassword] = useResetPartnerPasswordMutation()

  const currentDealer = dealersRes?.data?.find((d) => d.id === id || d._id === id)

  // Form State
  const [dealerName, setDealerName] = useState('')
  const [lockScreenNumber, setLockScreenNumber] = useState('')
  const [emailId, setEmailId] = useState('')
  const [shop, setShop] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [pincode, setPincode] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (currentDealer) {
      setDealerName(currentDealer.name || '')
      setLockScreenNumber(currentDealer.phone || '')
      setEmailId(currentDealer.email || '')
      setShop(currentDealer.agencyName || currentDealer.name || '')
      setCity(currentDealer.city || '')
      setState(currentDealer.state || currentDealer.territory || '')
    }
  }, [currentDealer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanedPhone = lockScreenNumber.replace(/\D/g, '')
    if (cleanedPhone.length !== 10) {
      toast.error('Lock screen / Contact phone must be exactly 10 digits.')
      return
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setIsSaving(true)

    try {
      if (id) {
        await updatePartnerProfile({
          userId: id,
          data: {
            name: dealerName.trim(),
            agencyName: shop.trim(),
            phone: cleanedPhone,
            email: emailId.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            district: district.trim(),
            pincode: pincode.trim(),
            ...(password ? { password } : {}),
          },
        }).unwrap()
      }
      toast.success(`Dealer details for "${shop}" saved successfully!`)
      navigate(ROUTE_PATHS.DEALERS)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update dealer')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.DEALERS)}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Edit Dealer Profile</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Modify retail shop information, login credentials, and contact details</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg border border-border">
          Code: {currentDealer?.entityCode || id || '—'}
        </span>
      </div>

      {/* 2-Column Responsive Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Dealer Name</label>
              <input
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Lock Screen Number</label>
              <input
                type="text"
                value={lockScreenNumber}
                onChange={(e) => setLockScreenNumber(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email Id</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Shop Name</label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Portal Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-border p-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Changes Button */}
        <div className="pt-4 border-t border-border flex items-center justify-start gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-action-primary text-sm font-bold h-10 px-8 shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.DEALERS)}
            className="px-5 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
