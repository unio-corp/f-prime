import type { MoodboardTile } from "@/types/moodboard";

import { MOODBOARD_TILES } from "./tiles";
import { toMoodItem } from "./to-mood-item";

/**
 * L'unico punto che sa da dove arrivano i contenuti della moodboard.
 *
 * Oggi legge il file statico in questa cartella; domani interrogherà Sanity.
 * Nessun modulo esterno importa `./tiles`, quindi cambiare la sorgente resta
 * una modifica a queste due funzioni. La validazione vive accanto, in
 * `./to-mood-item`, per restare testabile senza passare dai dati reali.
 */

export type { DetailMedium, MoodItem } from "./to-mood-item";

export async function getAllMoodItems() {
  return MOODBOARD_TILES.map(toMoodItem);
}

export async function getMoodItem(slug: string) {
  const tile = MOODBOARD_TILES.find((candidate: MoodboardTile) => `tile-${candidate.id}` === slug);
  return tile ? toMoodItem(tile) : null;
}
