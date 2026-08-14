import type { MoodboardTile as MoodboardTileData } from "@/types/moodboard";

import { TileMedia } from "./TileMedia";

interface MoodboardTileProps {
  tile: MoodboardTileData;
  onOpen: (tileId: number) => void;
  /** The first row is above the fold at every breakpoint. */
  priority?: boolean;
}

/**
 * One grid cell: `aspect-ratio: 1/1.25`, `overflow: hidden`, and a full-bleed
 * button trigger. The target site has **no hover effect** on tiles — only
 * `cursor: pointer` and an inset focus ring.
 */
export function MoodboardTile({ tile, onOpen, priority }: MoodboardTileProps) {
  const count = tile.products.length;

  return (
    <div className="relative aspect-[1/1.25] overflow-hidden">
      <button
        type="button"
        aria-label={`Preview ${count} product${count === 1 ? "" : "s"}`}
        onClick={() => onOpen(tile.id)}
        className="relative h-full w-full cursor-pointer align-top focus-visible:shadow-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:shadow-[inset_0_0_0_var(--spacing-fp-ring)_var(--color-fp-focus)] focus-visible:after:content-['']"
      >
        <TileMedia media={tile.media} priority={priority} />
      </button>
    </div>
  );
}
