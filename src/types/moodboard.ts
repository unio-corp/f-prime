/**
 * Content contracts for the moodboard. Shapes are narrowed to what the UI
 * actually renders.
 */

export interface MoodboardImageMedia {
  kind: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface MoodboardVideoMedia {
  kind: "video";
  src: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
}

export type MoodboardMedia = MoodboardImageMedia | MoodboardVideoMedia;

export interface MoodboardProductImage {
  src: string;
  width: number;
  height: number;
}

export interface MoodboardProduct {
  handle: string;
  title: string;
  href: string;
  price: number;
  currency: string;
  color: string | null;
  image: MoodboardProductImage | null;
  image2: MoodboardProductImage | null;
}

/** One cell of the moodboard grid. `products` holds product handles. */
export interface MoodboardTile {
  id: number;
  media: MoodboardMedia;
  products: string[];
}
