import type { LyricsLine } from '../../lib/types/api'
import type { YomitanToken } from '../../lib/yomitan/core'
import { cn } from '../../lib/utils'

interface LyricsTimelineProps {
  lines: LyricsLine[]
  activeIndex: number
  tokenizedLines: Partial<Record<number, YomitanToken[]>>
  onLineSeek: (line: LyricsLine, index: number) => void
  onWordTap: (token: YomitanToken) => void
  registerLineRef: (index: number, node: HTMLButtonElement | null) => void
}

export function LyricsTimeline({
  lines,
  activeIndex,
  tokenizedLines,
  onLineSeek,
  onWordTap,
  registerLineRef,
}: LyricsTimelineProps) {
  return (
    <div className="space-y-3 pb-36 pt-4">
      {lines.map((line, index) => {
        const isActive = index === activeIndex
        const tokens = tokenizedLines[index]

        return (
          <button
            key={`${line.startTimeMs}-${index}`}
            type="button"
            ref={(node) => registerLineRef(index, node)}
            onClick={() => onLineSeek(line, index)}
            className={cn(
              'block w-full rounded-lg border px-3 py-2 text-left transition-all',
              isActive
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700',
            )}
          >
            <span className="mr-2 text-xs text-slate-500">{index + 1}</span>
            <span className="inline-flex flex-wrap items-center gap-1 leading-7">
              {tokens?.length
                ? tokens.map((token, tokenIndex) => {
                    if (!token.selectable) {
                      return (
                        <span key={`${index}-${tokenIndex}-${token.text}`}>{token.text}</span>
                      )
                    }

                    return (
                      <span
                        key={`${index}-${tokenIndex}-${token.text}`}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          onWordTap(token)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onWordTap(token)
                          }
                        }}
                        className="rounded-sm border border-cyan-500/40 bg-cyan-500/15 px-1.5 py-0.5 text-cyan-200"
                      >
                        {token.text}
                      </span>
                    )
                  })
                : line.words}
            </span>
          </button>
        )
      })}
    </div>
  )
}
