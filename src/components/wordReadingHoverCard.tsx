import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import type { WordReading } from "~/types/ichiran";

export default function WordReadingHoverCard({
  wordReading,
  romanji,
}: {
  wordReading: WordReading;
  romanji: string;
}) {
  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>
        <span className="hover:underline">{wordReading.text}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm">
        <div>
          {romanji} / {wordReading.kana}
        </div>
        {wordReading.components && (
          <ol>
            {wordReading.components.map(
              (comp, compIdx) =>
                comp.conj && (
                  <ol key={`comp-${compIdx}`}>
                    {comp.conj.map((conj, conjIdx) => (
                      <li key={`conj-${conjIdx}`}>
                        <div>{conj.reading}</div>
                        <ol>
                          {conj.gloss.map((gloss, glossIdx) => (
                            <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                              glossIdx + 1
                            }. ${gloss.pos} ${gloss.gloss}`}</li>
                          ))}
                        </ol>
                      </li>
                    ))}
                  </ol>
                ),
            )}
          </ol>
        )}
        {wordReading.conj && (
          <ol>
            {wordReading.conj.map((conj, conjIdx) => (
              <li key={`conj-${conjIdx}`}>
                <div>{conj.reading}</div>
                <ol>
                  {conj.gloss.map((gloss, glossIdx) => (
                    <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                      glossIdx + 1
                    }. ${gloss.pos} ${gloss.gloss}`}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
        {wordReading.gloss && (
          <ol>
            {wordReading.gloss.map((gloss, idx) => (
              <li key={`gloss-${idx}`}>{`${idx + 1}. ${gloss.pos} ${
                gloss.gloss
              }`}</li>
            ))}
          </ol>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
