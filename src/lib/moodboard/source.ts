import type { MoodboardProduct, MoodboardTile } from "@/types/moodboard";

import { MOODBOARD_PRODUCTS } from "./products";
import { MOODBOARD_TILES } from "./tiles";

/**
 * The single place that knows where moodboard content comes from.
 *
 * Today it reads the static files in this folder; tomorrow it will query
 * Sanity. Nothing outside this module imports `./tiles` or `./products`, so
 * swapping the backing store stays a change to these two functions.
 */

/** A Tile with its products already resolved — what the UI consumes. */
export interface MoodItem extends Omit<MoodboardTile, "products"> {
  /** Stable public identifier. Derived from the id until the CMS supplies one. */
  slug: string;
  products: MoodboardProduct[];
}

function toMoodItem(tile: MoodboardTile): MoodItem {
  return {
    ...tile,
    slug: `tile-${tile.id}`,
    products: tile.products
      .map((handle) => MOODBOARD_PRODUCTS[handle])
      .filter((product): product is MoodboardProduct => Boolean(product)),
  };
}

export async function getAllMoodItems(): Promise<MoodItem[]> {
  return MOODBOARD_TILES.map(toMoodItem);
}

export async function getMoodItem(slug: string): Promise<MoodItem | null> {
  const tile = MOODBOARD_TILES.find((candidate) => `tile-${candidate.id}` === slug);
  return tile ? toMoodItem(tile) : null;
}
