import type { ComponentType, ReactNode } from "react";

import type { MoodItem } from "@/lib/moodboard/source";

import { DoubleColumn } from "./DoubleColumn";
import { GalleryColumn } from "./GalleryColumn";
import type { CursorLabel, ModalColumnProps, RightColumnLayout } from "./modal-contracts";

/**
 * Registro dei renderer della colonna destra, indicizzati per layout.
 *
 * Aggiungere un layout significa scrivere un componente e registrarlo qui: il
 * guscio del modale non cambia mai. `zoom` è assente di proposito, perché è il
 * layout senza colonna destra: la sinistra occupa tutta la larghezza.
 */
export const RIGHT_COLUMN_RENDERERS: {
  [K in RightColumnLayout]?: ComponentType<ModalColumnProps<K>>;
} = { double: DoubleColumn, gallery: GalleryColumn };

/**
 * Risolve il layout effettivamente reso. I dati incoerenti non arrivano più
 * fin qui — li ferma `toMoodItem()` — quindi resta un solo caso: dati validi
 * per un layout il cui renderer non è ancora scritto.
 */
const warned = new Set<RightColumnLayout>();

export function resolveModalLayout(layout: MoodItem["modal"]): MoodItem["modal"] {
  if (layout === "zoom" || RIGHT_COLUMN_RENDERERS[layout]) return layout;

  if (process.env.NODE_ENV !== "production" && !warned.has(layout)) {
    warned.add(layout);
    console.warn(
      `[moodboard] No renderer registered for modal layout "${layout}" — falling back to "zoom".`,
    );
  }

  return "zoom";
}

/**
 * L'unico punto in cui la dispatch dinamica incontra la union: TypeScript non
 * collega da solo la chiave `item.modal` al ramo di `MoodItem` corrispondente,
 * e questo `as` è il prezzo — pagato una volta, qui, invece che in ogni
 * renderer.
 */
export function renderRightColumn(
  item: MoodItem,
  onCursorLabel: (label: CursorLabel) => void,
): ReactNode {
  if (resolveModalLayout(item.modal) === "zoom" || item.modal === "zoom") return null;

  const Renderer = RIGHT_COLUMN_RENDERERS[item.modal] as ComponentType<{
    item: MoodItem;
    onCursorLabel: (label: CursorLabel) => void;
  }>;

  return <Renderer item={item} onCursorLabel={onCursorLabel} />;
}
