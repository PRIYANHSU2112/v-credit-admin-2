import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MOCK_DEALERS } from '@/mocks/mockSeedData'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { toast } from 'sonner'

export default function EditDealerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Find dealer by id or fallback to first dealer (Malviya mobile hub)
  const initialDealer = MOCK_DEALERS.find((d) => d.id === id) || MOCK_DEALERS[0]

  // Form State
  const [dealerName, setDealerName] = useState(initialDealer.dealerName || 'Abhishek malviya')
  const [lockScreenNumber, setLockScreenNumber] = useState(initialDealer.lockScreenNumber || '9183689544')
  const [emailId, setEmailId] = useState(initialDealer.email || 'abhimalviya319@gmail.com')
  const [shop, setShop] = useState(initialDealer.dealerShop || 'Malviya mobile hub')
  const [password, setPassword] = useState(initialDealer.password || 'Emi@123')
  const [address, setAddress] = useState(initialDealer.address || 'Bus stand Sukhtawa kalaakhar road sukhtawa')
  const [city, setCity] = useState(initialDealer.city || 'Betul')
  const [state, setState] = useState(initialDealer.state || 'Madhya Pradesh')
  const [district, setDistrict] = useState(initialDealer.district || 'sukhtawa')
  const [pincode, setPincode] = useState(initialDealer.pincode || '460001')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      setIsSaving(false)
      // Update in memory
      initialDealer.dealerName = dealerName
      initialDealer.lockScreenNumber = lockScreenNumber
      initialDealer.email = emailId
      initialDealer.dealerShop = shop
      initialDealer.password = password
      initialDealer.address = address
      initialDealer.city = city
      initialDealer.state = state
      initialDealer.district = district
      initialDealer.pincode = pincode

      toast.success(`Dealer details for "${shop}" saved successfully!`)
      navigate(ROUTE_PATHS.DEALERS)
    }, 600)
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
            <p className="text-xs text-muted-foreground mt-0.5">Modify retail shop information, login credentials, and contact details</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-lg border border-border">
          Code: {initialDealer.dealerCode || '79746'}
        </span>
      </div>

      {/* 2-Column Responsive Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Dealer Name</label>
              <input
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Lock Screen Number</label>
              <input
                type="text"
                value={lockScreenNumber}
                onChange={(e) => setLockScreenNumber(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Id</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Shop Name</label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Portal Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-border p-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border px-3 text-xs text-foreground bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Changes Button */}
        <div className="pt-4 border-t border-border flex items-center justify-start gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-action-primary text-xs font-bold h-10 px-8 shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.DEALERS)}
            className="px-5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
