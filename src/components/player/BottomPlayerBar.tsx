import { Pause, Play, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { formatTime } from '../../lib/utils/format'
import type { SongSearchItem } from '../../lib/types/api'

interface BottomPlayerBarProps {
  track: SongSearchItem | null
  playing: boolean
  currentTime: number
  duration: number
  offlineReady: boolean
  downloading: boolean
  playDisabled: boolean
  onTogglePlay: () => void
  onSeek: (seconds: number) => void
  onDownload: () => void
}

export function BottomPlayerBar({
  track,
  playing,
  currentTime,
  duration,
  offlineReady,
  downloading,
  playDisabled,
  onTogglePlay,
  onSeek,
  onDownload,
}: BottomPlayerBarProps) {
  if (!track) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700 bg-slate-950/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <div className="flex items-center gap-3">
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="h-12 w-12 rounded-md border border-slate-800 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">{track.title}</p>
            <p className="truncate text-xs text-slate-400">{track.artist}</p>
          </div>
          {offlineReady ? <Badge variant="secondary">Offline</Badge> : null}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={downloading || offlineReady}
            onClick={onDownload}
            aria-label="Save offline"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            disabled={playDisabled}
            onClick={onTogglePlay}
            aria-label="Play or pause"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-11 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            disabled={playDisabled}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="h-1 w-full cursor-pointer accent-cyan-500"
          />
          <span className="w-11">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
