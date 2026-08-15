import type { MoodItem } from "@/lib/moodboard/source";

/**
 * Ciò che un renderer di colonna destra deve conoscere. Sta qui e non in
 * `./modal-layouts` perché quel modulo importa i componenti, e i componenti
 * importano questi tipi: insieme formerebbero un ciclo.
 */

/**
 * Etichetta del cursore dichiarata dal contenuto: `null` lascia al guscio il
 * suo `CLOSE`, `CURSOR_HIDDEN` non disegna nulla — per il contenuto inerte,
 * dove anche `CLOSE` mentirebbe.
 */
export const CURSOR_HIDDEN = "";

export type CursorLabel = string | null;

/** I layout che hanno una colonna destra: tutti tranne `zoom`. */
export type RightColumnLayout = Exclude<MoodItem["modal"], "zoom">;

export interface ModalColumnProps<K extends RightColumnLayout> {
  /** Ristretto al ramo di `MoodItem` che corrisponde al layout. */
  item: Extract<MoodItem, { modal: K }>;
  onCursorLabel: (label: CursorLabel) => void;
}
