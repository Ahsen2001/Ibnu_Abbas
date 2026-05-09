import { useEffect, useState } from 'react'

declare global {
  interface WindowEventMap {
    'network:activity': CustomEvent<{ count: number }>
  }
}

function NetworkActivityIndicator() {
  const [activeRequests, setActiveRequests] = useState(0)

  useEffect(() => {
    const handleActivity = (event: WindowEventMap['network:activity']) => {
      setActiveRequests(event.detail.count)
    }

    window.addEventListener('network:activity', handleActivity)

    return () => window.removeEventListener('network:activity', handleActivity)
  }, [])

  return (
    <>
      <div
        aria-hidden={activeRequests === 0}
        className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden transition-opacity duration-300 ${activeRequests > 0 ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="loading-bar h-full w-1/3 bg-college-green shadow-[0_0_18px_rgba(13,148,136,0.4)]" />
      </div>
      <div
        aria-live="polite"
        className={`pointer-events-none fixed right-4 top-4 z-[70] rounded-full border border-teal-200 bg-white/95 px-3 py-2 text-xs font-semibold text-college-green shadow-soft transition-all duration-300 ${activeRequests > 0 ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
      >
        Syncing latest updates...
      </div>
    </>
  )
}

export default NetworkActivityIndicator
