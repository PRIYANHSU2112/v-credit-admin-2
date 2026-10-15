interface EmiSafeLogoProps {
  className?: string
  size?: number
  showText?: boolean
  showBadge?: boolean
}

export function EmiSafeLogo({
  className = '',
  size = 44,
  showText = false,
  showBadge = false,
}: EmiSafeLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 rounded-full p-[2px] bg-gradient-to-br from-lime-400 via-emerald-500 to-green-800 shadow-md transition-all duration-300 hover:scale-105 group"
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-emerald-950 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="V-Credit Emblem"
            className="w-full h-full object-cover object-center select-none"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        {/* Subtle glowing ambient ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xs -z-10 group-hover:bg-emerald-400/40 transition-colors" />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-lg tracking-tight text-foreground leading-none">
              V-CREDIT
            </span>
            {showBadge && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                CONSOLE
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide mt-0.5">
            Device Security & MDM
          </span>
        </div>
      )}
    </div>
  )
}
