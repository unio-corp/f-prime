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
 * Ciò che il guscio deve sapere sulla colonna sinistra (la copertina, che
 * comunque rende lui) per un dato layout — senza saperne il nome.
 */
interface LeftColumnConfig {
  /** Classe applicata al div che avvolge `ZoomMedia`. */
  className?: string;
  /**
   * Se vero, la copertina condivide l'altezza della colonna destra invece
   * della propria altezza naturale, ritagliando con `object-fit: cover`.
   * Passato a `ZoomMedia`, che lo applica solo al proprio stato `full`.
   */
  matchHeight?: boolean;
}

/**
 * Configurazione della colonna sinistra per-layout. `gallery`: la copertina
 * resta ancorata in basso mentre la colonna destra, più alta, scorre.
 * `double`: le due immagini devono avere la stessa altezza — lo decide il
 * proprietario del progetto, non le proporzioni naturali dei due Media.
 */
const LEFT_COLUMN_CONFIG: { [K in RightColumnLayout]?: LeftColumnConfig } = {
  gallery: { className: "nav:self-end nav:sticky nav:bottom-0" },
  double: { matchHeight: true },
};

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

/**
 * Configurazione della colonna sinistra per l'item corrente. Il guscio la
 * applica senza sapere per quale layout: la conoscenza resta qui, nel registro.
 */
export function getLeftColumnConfig(item: MoodItem): LeftColumnConfig {
  if (item.modal === "zoom") return {};
  return LEFT_COLUMN_CONFIG[item.modal] ?? {};
}
