import type { MoodItem } from "@/lib/moodboard/source";
import { cn } from "@/lib/utils";

import { TileMedia } from "./TileMedia";

interface MoodboardTileProps {
  item: MoodItem;
  onOpen: (slug: string) => void;
  /** La prima riga è above the fold a ogni breakpoint. */
  priority?: boolean;
  /** Sotto `nav:` la griglia a 4 colonne mostra 16 Tile: 18 lascerebbero
   *  l'ultima riga con due sole celle, quindi due Tile si nascondono. */
  hiddenBelowNav?: boolean;
}

/**
 * Una cella della griglia: `aspect-ratio: 1/1.25`, `overflow: hidden` e un
 * pulsante che occupa tutta la cella. Le Tile **non hanno effetto hover** —
 * solo `cursor: pointer` e un anello di focus interno.
 */
export function MoodboardTile({ item, onOpen, priority, hiddenBelowNav }: MoodboardTileProps) {
  return (
    <div
      className={cn(
        "relative aspect-[1/1.25] overflow-hidden",
        hiddenBelowNav && "hidden nav:block",
      )}
    >
      <button
        type="button"
        aria-label="Open preview"
        onClick={() => onOpen(item.slug)}
        className="relative h-full w-full cursor-pointer align-top focus-visible:shadow-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:shadow-[inset_0_0_0_var(--spacing-fp-ring)_var(--color-fp-focus)] focus-visible:after:content-['']"
      >
        <TileMedia media={item.media} priority={priority} />
      </button>
    </div>
  );
}
