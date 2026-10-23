import React, { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../api/settingsApi'

export default function KeyPriceSettingPage() {
  const { data: settingsRes, isLoading, isFetching, refetch } = useGetSettingsQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()

  const [newPrice, setNewPrice] = useState('')

  const activePrice = settingsRes?.data?.platform?.keyPrice ?? 350

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = parseFloat(newPrice)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Please enter a valid positive key price.')
      return
    }

    try {
      await updateSettings({ keyPrice: parsedPrice }).unwrap()
      toast.success(`Standard Key price updated to ₹${parsedPrice} per key successfully!`)
      setNewPrice('')
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update key price')
    }
  }

  return (
    <div className="bg-card p-8 rounded-2xl shadow-xs border border-border max-w-2xl text-card-foreground">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Standard Key Price Setting</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure default retail and distributor billing unit price per Android key</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Refresh Active Price"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Old Key Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Current Active Price (₹ / Key)</label>
          <input
            type="text"
            value={isLoading ? 'Loading active price...' : `₹${activePrice}`}
            disabled
            className="w-full h-11 rounded-xl border border-border px-4 text-sm bg-muted text-muted-foreground cursor-not-allowed font-mono font-bold"
          />
        </div>

        {/* New Key Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">New Key Price (₹)</label>
          <input
            type="number"
            placeholder="Enter new price per key (e.g. 350)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            min="0"
            step="0.01"
            disabled={isSaving}
            className="w-full h-11 rounded-lg border border-border px-4 text-sm bg-background text-foreground font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || !newPrice}
          className="btn-action-primary font-bold px-8 py-2.5 rounded-lg text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </form>
    </div>
  )
}
