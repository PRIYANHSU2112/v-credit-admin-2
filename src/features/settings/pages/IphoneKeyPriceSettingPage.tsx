import React, { useState } from 'react'
import { toast } from 'sonner'

export default function IphoneKeyPriceSettingPage() {
  const [oldPrice] = useState('600')
  const [newPrice, setNewPrice] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPrice) {
      toast.error('Please enter a new iPhone key price.')
      return
    }
    toast.success(`iPhone key price updated to ₹${newPrice} per key successfully!`)
    setNewPrice('')
  }

  return (
    <div className="bg-card p-8 rounded-2xl shadow-xs border border-border max-w-2xl text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">iPhone Key Price Setting</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure default retail and distributor billing unit price per Apple iOS key</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Old Key Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Current Active iPhone Price (₹ / Key)</label>
          <input
            type="text"
            value={`₹${oldPrice}`}
            disabled
            className="w-full h-11 rounded-xl border border-border px-4 text-sm bg-muted text-muted-foreground cursor-not-allowed font-mono font-bold"
          />
        </div>

        {/* New iPhone Key Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">New iPhone Key Price (₹)</label>
          <input
            type="number"
            placeholder="Enter price per iPhone key"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            min="0"
            step="0.01"
            className="w-full h-11 rounded-lg border border-border px-4 text-sm bg-background text-foreground font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="btn-action-primary font-bold px-8 py-2.5 rounded-lg text-sm shadow-xs"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
