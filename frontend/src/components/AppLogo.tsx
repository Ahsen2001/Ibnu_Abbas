type AppLogoProps = {
  compact?: boolean
}

function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo.jpeg" alt="IBNU ABBAS Arabic College" className="h-11 w-11 rounded-lg bg-white object-cover" />
      {!compact && (
        <div className="leading-tight">
          <strong className="block text-sm font-bold text-current">IBNU ABBAS</strong>
          <span className="block text-xs text-current/70">Arabic College</span>
        </div>
      )}
    </div>
  )
}

export default AppLogo
