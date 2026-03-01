import { Button } from '../ui/button'

interface YomitanPopupProps {
  open: boolean
  term: string
  html: string
  loading: boolean
  onClose: () => void
}

export function YomitanPopup({ open, term, html, loading, onClose }: YomitanPopupProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <button
        aria-label="Close popup"
        className="absolute inset-0"
        type="button"
        onClick={onClose}
      />
      <div className="relative z-10 w-full rounded-t-2xl border border-slate-700 bg-slate-950 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Yomitan Lookup</p>
            <p className="text-sm font-semibold text-slate-100">{term}</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Looking up dictionary entries...</p>
        ) : (
          <iframe
            title="Yomitan definitions"
            className="h-[55vh] w-full rounded-md border border-slate-800 bg-slate-900"
            srcDoc={html}
          />
        )}
      </div>
    </div>
  )
}
