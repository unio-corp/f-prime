import type { MoodItem } from "@/lib/moodboard/source";

import { TileMedia } from "./TileMedia";

interface MoodboardTileProps {
  item: MoodItem;
  onOpen: (slug: string) => void;
  /** The first row is above the fold at every breakpoint. */
  priority?: boolean;
}

/**
 * One grid cell: `aspect-ratio: 1/1.25`, `overflow: hidden`, and a full-bleed
 * button trigger. Tiles have **no hover effect** — only `cursor: pointer` and
 * an inset focus ring.
 */
export function MoodboardTile({ item, onOpen, priority }: MoodboardTileProps) {
  const count = item.products.length;

  return (
    <div className="relative aspect-[1/1.25] overflow-hidden">
      <button
        type="button"
        aria-label={`Preview ${count} product${count === 1 ? "" : "s"}`}
        onClick={() => onOpen(item.slug)}
        className="relative h-full w-full cursor-pointer align-top focus-visible:shadow-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:shadow-[inset_0_0_0_var(--spacing-fp-ring)_var(--color-fp-focus)] focus-visible:after:content-['']"
      >
        <TileMedia media={item.media} priority={priority} />
      </button>
    </div>
  );
}
