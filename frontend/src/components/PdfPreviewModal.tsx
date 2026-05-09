import { Download, ExternalLink, X } from 'lucide-react'

type PdfPreviewModalProps = {
  open: boolean
  title: string
  previewUrl: string | null
  downloadUrl: string | null
  onClose: () => void
}

function PdfPreviewModal({ open, title, previewUrl, downloadUrl, onClose }: PdfPreviewModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Document Preview</p>
            <h2 className="mt-1 text-xl font-bold text-college-ink">{title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {downloadUrl ? (
              <a className="btn-primary" href={downloadUrl} rel="noreferrer" target="_blank">
                <Download size={16} />
                Download
              </a>
            ) : null}
            {previewUrl ? (
              <a className="btn-secondary" href={previewUrl} rel="noreferrer" target="_blank">
                <ExternalLink size={16} />
                Open Tab
              </a>
            ) : null}
            <button className="btn-secondary" onClick={onClose} type="button">
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100 p-3 sm:p-4">
          {previewUrl ? (
            <iframe className="h-full w-full rounded-xl border border-slate-200 bg-white" src={previewUrl} title={title} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              The preview link is not available anymore. Generate the document again to refresh its secure access window.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PdfPreviewModal
