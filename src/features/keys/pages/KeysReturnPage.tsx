import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useGetDistributorsQuery } from '@/features/partners/api/partnersApi'
import { useReclaimKeyBatchMutation } from '@/features/enterprise/api/enterpriseApi'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { toast } from 'sonner'

export default function KeysReturnPage() {
  const navigate = useNavigate()
  const { data: distRes, isLoading: isLoadingDistributors } = useGetDistributorsQuery()
  const [reclaimKeyBatch, { isLoading: isReclaiming }] = useReclaimKeyBatchMutation()

  const distributors = distRes?.data || []
  const [selectedDistributorId, setSelectedDistributorId] = useState('')
  const [numberOfKeys, setNumberOfKeys] = useState('')

  useEffect(() => {
    if (distributors.length > 0 && !selectedDistributorId) {
      setSelectedDistributorId(distributors[0].id || distributors[0]._id || '')
    }
  }, [distributors, selectedDistributorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(numberOfKeys, 10)
    if (isNaN(count) || count <= 0) {
      toast.error('Please enter a valid number of keys to return.')
      return
    }

    if (!selectedDistributorId) {
      toast.error('Please select a distributor.')
      return
    }

    const distObj = distributors.find((d) => (d.id || d._id) === selectedDistributorId)

    try {
      const res = await reclaimKeyBatch({
        fromUserId: selectedDistributorId,
        quantity: count,
        note: `Key return from ${distObj?.name || selectedDistributorId}`,
      }).unwrap()

      toast.success(res.message || `Successfully processed return of ${count} keys from ${distObj?.name || 'distributor'}!`)
      setNumberOfKeys('')
      navigate(ROUTE_PATHS.DISTRIBUTORS)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to process key return')
    }
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
        <span className="text-sm text-muted-foreground font-medium">Back to Distributors</span>
      </div>

      {/* Card */}
      <div className="max-w-xl bg-card rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Keys Return</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Distributor Name</label>
            {isLoadingDistributors ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span>Loading distributors...</span>
              </div>
            ) : (
              <select
                value={selectedDistributorId}
                onChange={(e) => setSelectedDistributorId(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              >
                {distributors.length === 0 ? (
                  <option value="">No distributors found</option>
                ) : (
                  distributors.map((d) => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.name} ({d.available ?? 0} available)
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Number of Keys</label>
            <input
              type="number"
              min={1}
              value={numberOfKeys}
              onChange={(e) => setNumberOfKeys(e.target.value)}
              placeholder="Enter Number of Keys for Return"
              required
              className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isReclaiming || isLoadingDistributors || distributors.length === 0}
              className="btn-action-primary text-sm font-bold h-10 px-8 disabled:opacity-50 flex items-center gap-2"
            >
              {isReclaiming && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isReclaiming ? 'Processing...' : 'Return Keys'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
