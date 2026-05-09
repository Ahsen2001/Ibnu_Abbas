import AppLogo from './AppLogo'

type PageLoaderProps = {
  title?: string
  message?: string
}

function PageLoader({
  title = 'Preparing your workspace',
  message = 'Loading the latest records and getting everything ready for you.',
}: PageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-college-mist px-4">
      <div className="panel w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <AppLogo />
        </div>
        <div className="mt-6">
          <div className="skeleton h-2.5 w-full overflow-hidden rounded-full">
            <div className="loading-bar h-full w-1/3 rounded-full bg-college-green/70" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-college-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default PageLoader
