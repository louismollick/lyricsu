import { Link } from '@tanstack/react-router'
import { Music2, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <Music2 className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide text-slate-100">Lyricsu</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-slate-800"
            activeProps={{ className: 'rounded-md bg-slate-800 px-3 py-1.5 text-cyan-300' }}
          >
            Home
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-slate-300 hover:bg-slate-800"
            activeProps={{
              className:
                'inline-flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-cyan-300',
            }}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
    </header>
  )
}
