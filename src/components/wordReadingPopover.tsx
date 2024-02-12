import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { WordReading } from "~/types/ichiran";

export default function WordReadingPopover({
  wordReading,
}: {
  wordReading: WordReading;
}) {
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="hover:underline">{wordReading.text}</span>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        side="top"
        className="max-h-56 w-80 overflow-scroll text-sm italic"
      >
        <div className="text-base not-italic">{wordReading.kana}</div>
        {wordReading.components?.length && (
          <ol>
            {wordReading.components.map(
              (comp, compIdx) =>
                !!comp.conj?.length && (
                  <ol key={`comp-${compIdx}`}>
                    {comp.conj.map((conj, conjIdx) => (
                      <li key={`conj-${conjIdx}`}>
                        <div>{conj.reading}</div>
                        {!!conj.gloss?.length && (
                          <ol>
                            {conj.gloss.map((gloss, glossIdx) => (
                              <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                                glossIdx + 1
                              }. ${gloss.pos} ${gloss.gloss}`}</li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                ),
            )}
          </ol>
        )}
        {!!wordReading.conj?.length && (
          <ol>
            {wordReading.conj.map((conj, conjIdx) => (
              <li key={`conj-${conjIdx}`}>
                <div>{conj.reading}</div>
                {!!conj.gloss?.length && (
                  <ol>
                    {conj.gloss.map((gloss, glossIdx) => (
                      <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                        glossIdx + 1
                      }. ${gloss.pos} ${gloss.gloss}`}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        )}
        {!!wordReading.gloss?.length && (
          <ol>
            {wordReading.gloss.map((gloss, idx) => (
              <li key={`gloss-${idx}`}>{`${idx + 1}. ${gloss.pos} ${
                gloss.gloss
              }`}</li>
            ))}
          </ol>
        )}
      </PopoverContent>
    </Popover>
  );
}
