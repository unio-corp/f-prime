"use client";

import { useRef, useState } from "react";

import type { MoodItem } from "@/lib/moodboard/source";

import { MoodboardTile } from "./MoodboardTile";
import { ProductsPreviewModal } from "./ProductsPreviewModal";

interface MoodboardGridProps {
  items: MoodItem[];
}

/**
 * An edge-to-edge grid, 4 columns until 1000px and 8 above it. No gap, no
 * container margin. Tiles are static: the 13 videos autoplay and loop,
 * nothing cycles or crossfades.
 *
 * `priority={item.id < 8}` covers ids 0-7: exactly the first row at the 8-col
 * desktop breakpoint (1440px measurement: 8 cols x 4 rows), and the first two
 * rows at the 4-col mobile breakpoint. We don't know the viewport at render
 * time, so the desktop row is the natural upper bound to eager-load; the
 * extra mobile row is a deliberate, small over-fetch (4 tiles) rather than
 * under-fetching what's above the fold on narrow screens.
 */
export function MoodboardGrid({ items }: MoodboardGridProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openItem = items.find((item) => item.slug === openSlug) ?? null;

  // The frozen `onOpen`/`onClose` interfaces don't carry the triggering
  // element, so focus is captured here (the actual document.activeElement at
  // click time is the tile's button) and restored when the modal closes.
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const handleOpen = (slug: string) => {
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenSlug(slug);
  };

  const handleClose = () => {
    setOpenSlug(null);
    lastFocusedRef.current?.focus();
    lastFocusedRef.current = null;
  };

  return (
    <div className="relative">
      <section aria-label="Moodboard" className="grid w-full grid-cols-4 nav:grid-cols-8">
        {items.map((item) => (
          <MoodboardTile key={item.slug} item={item} onOpen={handleOpen} priority={item.id < 8} />
        ))}
      </section>

      {openItem ? <ProductsPreviewModal item={openItem} onClose={handleClose} /> : null}
    </div>
  );
}
