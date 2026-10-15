import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppSelector } from '@/app/store/hooks'
import { toast } from 'sonner'

interface AddDistributorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddDistributorModal({ isOpen, onClose, onSuccess }: AddDistributorModalProps) {
  const { user } = useAppSelector((state) => state.auth)

  const [agency, setAgency] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Madhya Pradesh')
  const [password, setPassword] = useState('123456')
  const [allocatedKeys, setAllocatedKeys] = useState('50')

  const isSuper = user?.role === 'super_admin'
  const isDistributor = user?.role === 'distributor'

  const title = isSuper ? 'Add New Partner' : isDistributor ? 'Add New Dealer' : 'Add New Distributor'
  const description = isSuper
    ? 'Onboard a new Stockist, Distributor, or Dealer into the master network.'
    : isDistributor
    ? 'Enter retail dealer details to onboard into your city network.'
    : 'Enter partner details to onboard into your regional distributor network.'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agency || !phone) {
      toast.error('Agency/Shop name and phone are required!')
      return
    }

    toast.success(`${title} "${agency}" registered successfully!`, {
      description: `Initial ${allocatedKeys} keys transferred to partner.`,
    })

    setAgency('')
    setPhone('')
    setCity('')
    onClose()
    if (onSuccess) onSuccess()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Agency / Shop Name *</label>
          <Input
            type="text"
            placeholder="e.g. VEDA ENTERPRISE"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
            <Input
              type="tel"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Initial Key Quota</label>
            <Input
              type="number"
              value={allocatedKeys}
              onChange={(e) => setAllocatedKeys(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">City</label>
            <Input
              type="text"
              placeholder="e.g. Betul"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">State</label>
            <Input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Login Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <button type="submit" className="btn-action-primary text-xs font-bold py-2 px-5">
            Save & Onboard
          </button>
        </div>
      </form>
    </Modal>
  )
}
