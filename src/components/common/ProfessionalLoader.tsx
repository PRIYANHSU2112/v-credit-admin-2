import { EmiSafeLogo } from './EmiSafeLogo'

interface ProfessionalLoaderProps {
  message?: string
  fullScreen?: boolean
}

export function ProfessionalLoader({
  message = 'Loading dashboard records...',
  fullScreen = false,
}: ProfessionalLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 transition-all ${
        fullScreen
          ? 'fixed inset-0 z-50 bg-[#022312]/90 backdrop-blur-md'
          : 'min-h-[50vh] w-full'
      }`}
    >
      <div className="relative flex items-center justify-center mb-4">
        {/* Pulsing glow ring */}
        <div className="absolute -inset-3 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
        <div className="animate-bounce duration-1000">
          <EmiSafeLogo size={56} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        <p className="text-sm font-semibold tracking-wide text-white drop-shadow">
          {message}
        </p>
      </div>
    </div>
  )
}
