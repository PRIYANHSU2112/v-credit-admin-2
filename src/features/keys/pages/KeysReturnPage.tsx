import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MOCK_DISTRIBUTORS } from '@/mocks/mockSeedData'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { toast } from 'sonner'

export default function KeysReturnPage() {
  const navigate = useNavigate()
  const [selectedDistributor, setSelectedDistributor] = useState('Music Beats')
  const [numberOfKeys, setNumberOfKeys] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(numberOfKeys, 10)
    if (isNaN(count) || count <= 0) {
      toast.error('Please enter a valid number of keys to return.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success(`Successfully processed return of ${count} keys from ${selectedDistributor}!`)
      setNumberOfKeys('')
      navigate(ROUTE_PATHS.DISTRIBUTORS)
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTE_PATHS.DISTRIBUTORS)}
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground font-medium">Back to Distributors</span>
      </div>

      {/* Card */}
      <div className="max-w-xl bg-card rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Keys Return</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Distributor Name</label>
            <select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-xs text-foreground font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
            >
              {MOCK_DISTRIBUTORS.map((d) => (
                <option key={d.id} value={d.agency}>
                  {d.agency} ({d.availableKeys} available)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Number of Keys</label>
            <input
              type="number"
              min={1}
              value={numberOfKeys}
              onChange={(e) => setNumberOfKeys(e.target.value)}
              placeholder="Enter Number of Keys for Return"
              required
              className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary text-xs font-bold h-10 px-6 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Return Keys'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
