import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Lock,
  Unlock,
  Play,
  Send,
  MapPin,
  Phone,
  Navigation,
  ChevronDown,
  Copy,
  Check,
  FileText,
  Volume2,
  ArrowLeft,
} from 'lucide-react'
import { MOCK_USERS, type EmiSafeUserRecord } from '@/mocks/mockSeedData'
import { AgreementModal } from '@/components/common/AgreementModal'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export default function DeviceControlPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Find user by id or default to Sura uikey Topidhana
  const targetUser = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0]

  // State
  const [userRecord] = useState<EmiSafeUserRecord>(targetUser)
  const [deviceStatus, setDeviceStatus] = useState<'UNLOCKED' | 'LOCKED'>('UNLOCKED')
  const [appControlLocked, setAppControlLocked] = useState(false)
  const [appHidden, setAppHidden] = useState(false)
  const [deviceActivated, setDeviceActivated] = useState(true)
  const [usbLocked, setUsbLocked] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [callLocked, setCallLocked] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(false)

  // Accordion collapsibles
  const [deviceControlOpen, setDeviceControlOpen] = useState(true)
  const [advanceControlOpen, setAdvanceControlOpen] = useState(true)

  // Modals
  const [isAgreementOpen, setIsAgreementOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isViewPasswordOpen, setIsViewPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('123456')
  const [activePassword, setActivePassword] = useState('578985')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Unlock Code
  const unlockCode = userRecord.unlockCode || '578985'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(unlockCode)
    setCopiedCode(true)
    toast.success('Unlock Code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Device Action Controls
  const handleLockDevice = () => {
    setDeviceStatus('LOCKED')
    toast.error(`Remote Lock Command broadcasted to ${userRecord.userName}'s device!`)
  }

  const handleUnlockDevice = () => {
    setDeviceStatus('UNLOCKED')
    toast.success(`Remote Unlock Command dispatched to ${userRecord.userName}'s device!`)
  }

  const handleRemoveDevice = () => {
    toast.warning(`Device removal command sent for ${userRecord.userName}. Device un-enrolled.`)
  }

  // Sound Audio Reminder Simulation
  const handlePlayAudioReminder = () => {
    toast.info('Broadcasting EMI repayment audio voice alert to phone speaker...', {
      description: 'Audio prompt: "Please pay your upcoming smartphone EMI installment to avoid device lock."',
      icon: <Volume2 className="h-5 w-5 text-cyan-600 animate-bounce" />,
    })
  }

  const handleSendScreenReminder = () => {
    toast.success(`Sent on-screen overdue notification to ${userRecord.userPhone}`)
  }

  const handleGetLocation = () => {
    toast.success('Device GPS Ping Received: Lat 21.9023° N, Long 77.9014° E (Accuracy: 4 meters)')
  }

  const handleGetPhone = () => {
    toast.info(`Active SIM Card Phone: +91 ${userRecord.userPhone}`)
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back button and page breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users List</span>
        </button>
        <span className="text-xs text-muted-foreground font-mono">ID: {userRecord.id}</span>
      </div>

      {/* Brand Title Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 py-3.5 text-center shadow-sm rounded-2xl border border-emerald-400/30">
        <h1 className="text-2xl font-black tracking-widest text-white uppercase font-mono drop-shadow-xs flex items-center justify-center gap-2">
          <span>EMI SAFE</span>
          <span className="text-xs bg-black/20 text-white/90 px-2 py-0.5 rounded-full font-sans tracking-normal font-medium">MDM Active</span>
        </h1>
      </div>

      {/* Top 2 Columns: Customer Details vs Device Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Customer Details, Agreement, Unlock Codes */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-card rounded-2xl p-6 shadow-xs border border-border text-card-foreground">
            <h2 className="text-base font-bold text-foreground text-center pb-3 border-b border-border uppercase tracking-wide">
              CUSTOMER DETAILS
            </h2>

            <div className="divide-y divide-border/60 text-xs pt-2">
              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Loan Id:</span>
                <span className="text-muted-foreground font-mono">{userRecord.loanId || 'old infinix'}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Name:</span>
                <span className="text-foreground font-semibold">{userRecord.userName}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Email:</span>
                <span className="text-muted-foreground">{userRecord.email || 'sura@gmail.com'}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Mobile:</span>
                <span className="text-foreground font-mono font-semibold">{userRecord.userPhone}</span>
              </div>
            </div>
          </div>

          {/* Agreement Card */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border border-border text-card-foreground hover:border-primary/40 transition-colors">
            <button
              type="button"
              onClick={() => setIsAgreementOpen(true)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>Agreement</span>
                  <span className="text-muted-foreground">&gt;</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Tap to View loan sanction & device custody agreement</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Unlock Codes Card */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border border-border text-card-foreground">
            <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
              Unlock Codes
            </h3>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-primary/15 text-primary border border-primary/30 font-mono font-bold text-base shadow-xs select-all">
                {unlockCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Copy Unlock Code"
              >
                {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Device Details */}
        <div className="bg-card rounded-2xl p-6 shadow-xs border border-border text-card-foreground space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">
              DEVICE DETAILS
            </h2>

            {/* 3 Action Buttons: LOCK, UNLOCK, REMOVE */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLockDevice}
                className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                LOCK
              </button>
              <button
                type="button"
                onClick={handleUnlockDevice}
                className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                UNLOCK
              </button>
              <button
                type="button"
                onClick={handleRemoveDevice}
                className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
              >
                REMOVE
              </button>
            </div>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">App Update</span>
              <button
                type="button"
                onClick={() => toast.success('App is up to date (Version 3.4.2)')}
                className="text-primary hover:underline font-medium"
              >
                Check Update
              </button>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">Status:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  deviceStatus === 'UNLOCKED' ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {deviceStatus === 'UNLOCKED' ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" /> UNLOCKED
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> LOCKED
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">Key Code</span>
              <span className="font-mono text-foreground font-semibold">{userRecord.keyCode || '---'}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">Brand</span>
              <span className="text-foreground">{userRecord.deviceName ? 'INFINIX' : 'N/A'}</span>
            </div>

            <div className="py-2.5 space-y-1">
              <span className="font-bold text-foreground block">Device Agent</span>
              <p className="text-muted-foreground leading-relaxed font-mono text-[11px] bg-muted/40 p-2.5 rounded-lg border border-border/60">
                {userRecord.deviceAgent ||
                  'Device - INFINIX MOBILITY LIMITED Infinix X6512, Android Version - 11, SDK - 30'}
              </p>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">IMEI 1</span>
              <span className="font-mono text-foreground font-semibold">
                {userRecord.imei1 || '352839711277967'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">IMEI 2</span>
              <span className="font-mono text-foreground font-semibold">
                {userRecord.imei2 || '352839711277975'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-foreground">Device Install Date</span>
              <span className="text-muted-foreground font-mono">{userRecord.activationDate || '14/10/2026 19:17:33'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section 1: DEVICE CONTROL Collapsible */}
      <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden text-card-foreground">
        <button
          type="button"
          onClick={() => setDeviceControlOpen(!deviceControlOpen)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-muted/30 hover:bg-muted/50 border-b border-border transition-colors cursor-pointer"
        >
          <span className="text-sm font-black text-foreground uppercase tracking-wider">
            DEVICE CONTROL
          </span>
          <ChevronDown
            className={`h-4 w-4 text-foreground transition-transform duration-200 ${
              deviceControlOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {deviceControlOpen && (
          <div className="p-6 space-y-4 text-xs">
            {/* Row 1: Set Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">Set Password</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-5 py-1.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewPasswordOpen(true)}
                  className="px-5 py-1.5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  View Password
                </button>
              </div>
            </div>

            {/* Row 2: Wallpaper */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">Wallpaper</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toast.success('Overdue repayment reminder wallpaper applied to customer screen')}
                  className="px-5 py-1.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Set Wallpaper
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Custom wallpaper removed. Default phone wallpaper restored.')}
                  className="px-5 py-1.5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Remove Wallpaper
                </button>
              </div>
            </div>

            {/* Row 3: App Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">App Control</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppControlLocked(true)
                    toast.error('All 3rd-party user apps locked on target device')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    appControlLocked ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  LOCK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppControlLocked(false)
                    toast.success('App lock removed. Apps unlocked.')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    !appControlLocked ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  UNLOCK
                </button>
              </div>
            </div>

            {/* Row 4: App Hide/Unhide */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">App Hide/Unhide</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppHidden(true)
                    toast.info('Management launcher hidden from phone home drawer')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    appHidden ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  Hide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppHidden(false)
                    toast.success('Management icon made visible in app drawer')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    !appHidden ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Unhide
                </button>
              </div>
            </div>

            {/* Row 5: Activate/Deactivate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">Activate/Deactivate</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeviceActivated(false)
                    toast.error('Device enrollment suspended (Deactivated)')
                  }}
                  className={`px-5 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    !deviceActivated ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  DEACTIVATE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceActivated(true)
                    toast.success('Device enrollment reactivated')
                  }}
                  className={`px-5 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    deviceActivated ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  ACTIVATE
                </button>
              </div>
            </div>

            {/* Row 6: USB */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">USB</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUsbLocked(true)
                    toast.error('USB Debugging & Data Transfer blocked on phone')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    usbLocked ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  Lock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsbLocked(false)
                    toast.success('USB Data Port unblocked')
                  }}
                  className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                    !usbLocked ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Unlock
                </button>
              </div>
            </div>

            {/* Row 7: Reboot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <span className="font-bold text-foreground text-sm">Reboot</span>
              <div>
                <button
                  type="button"
                  onClick={() => toast.warning('Dispatched remote reboot instruction to customer phone.')}
                  className="px-8 py-1.5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Reboot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section 2: ADVANCE CONTROL Collapsible */}
      <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden text-card-foreground">
        <button
          type="button"
          onClick={() => setAdvanceControlOpen(!advanceControlOpen)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-muted/30 hover:bg-muted/50 border-b border-border transition-colors cursor-pointer"
        >
          <span className="text-sm font-black text-foreground uppercase tracking-wider">
            ADVANCE CONTROL
          </span>
          <ChevronDown
            className={`h-4 w-4 text-foreground transition-transform duration-200 ${
              advanceControlOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {advanceControlOpen && (
          <div className="p-6 space-y-6 text-xs">
            {/* Grid of Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EMI Audio Reminder */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">EMI Audio Reminder</span>
                <button
                  type="button"
                  onClick={handlePlayAudioReminder}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play</span>
                </button>
              </div>

              {/* EMI Reminder By Screen */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">EMI Reminder By Screen</span>
                <button
                  type="button"
                  onClick={handleSendScreenReminder}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Get Location */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">Get Location</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Get</span>
                </button>
              </div>

              {/* Get Phone Number */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">Get Phone Number</span>
                <button
                  type="button"
                  onClick={handleGetPhone}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Get</span>
                </button>
              </div>

              {/* Get Location Via Message */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">Get Location Via Message</span>
                <button
                  type="button"
                  onClick={() => toast.success('Dispatched silent SMS request for GPS coordinates')}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Get</span>
                </button>
              </div>

              {/* Phone display */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground">Phone</span>
                <span className="font-mono text-foreground font-bold text-sm">
                  {userRecord.userPhone}
                </span>
              </div>

              {/* View Location */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60 md:col-span-2">
                <span className="font-bold text-foreground">View Location</span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>

            {/* Bottom 3 Toggle Rows: Location, Call, Camera */}
            <div className="space-y-3 pt-2 border-t border-border">
              {/* Location: ON / OFF */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground text-sm">Location</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationEnabled(true)
                      toast.success('Device GPS Location tracking turned ON')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      locationEnabled ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationEnabled(false)
                      toast.info('Device GPS Location tracking turned OFF')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      !locationEnabled ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    OFF
                  </button>
                </div>
              </div>

              {/* Call: LOCK / UNLOCK */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground text-sm">Call</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCallLocked(true)
                      toast.error('Outgoing voice calling barred on phone')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      callLocked ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    LOCK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCallLocked(false)
                      toast.success('Outgoing call permissions restored')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      !callLocked ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    UNLOCK
                  </button>
                </div>
              </div>

              {/* Camera: LOCK / UNLOCK */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-bold text-foreground text-sm">Camera</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraLocked(true)
                      toast.error('Device camera hardware disabled')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      cameraLocked ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    LOCK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraLocked(false)
                      toast.success('Camera hardware enabled')
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-xs ${
                      !cameraLocked ? 'bg-emerald-700 text-white ring-2 ring-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    UNLOCK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agreement Modal */}
      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
      />

      {/* Password Reset Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Device Passcode"
        size="sm"
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-muted-foreground">
            Set a new temporary unlock passcode for {userRecord.userName}&apos;s device:
          </p>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-border px-3 text-sm font-mono font-bold text-foreground bg-background text-center tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePassword(newPassword)
                setIsPasswordModalOpen(false)
                toast.success(`Device passcode updated to: ${newPassword}`)
              }}
              className="btn-action-primary text-xs font-bold px-4 py-1.5"
            >
              Update Passcode
            </button>
          </div>
        </div>
      </Modal>

      {/* View Password Modal */}
      <Modal
        isOpen={isViewPasswordOpen}
        onClose={() => setIsViewPasswordOpen(false)}
        title="Current Device Passcode"
        size="sm"
      >
        <div className="p-4 text-center space-y-3">
          <p className="text-xs text-muted-foreground">The current active unlock PIN configured on device:</p>
          <div className="p-3 bg-muted rounded-xl text-2xl font-mono font-black tracking-widest text-foreground border border-border">
            {activePassword}
          </div>
          <button
            type="button"
            onClick={() => setIsViewPasswordOpen(false)}
            className="px-5 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Live Location Map Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Real-time Device Location"
        size="md"
      >
        <div className="space-y-3 text-xs">
          <div className="h-56 bg-slate-900 rounded-xl border border-border flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 animate-ping absolute inset-0" />
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg relative z-10">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-card/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-border shadow-md text-center text-card-foreground">
                <p className="font-bold text-foreground">{userRecord.userName}&apos;s Device</p>
                <p className="text-[11px] text-muted-foreground font-mono">21.9023° N, 77.9014° E (Betul, MP)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground pt-1">
            <span>Last report: Just now (GPS High Accuracy)</span>
            <button
              type="button"
              onClick={() => {
                window.open('https://maps.google.com/?q=21.9023,77.9014', '_blank')
              }}
              className="text-primary font-semibold hover:underline"
            >
              Open in Google Maps &rarr;
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
