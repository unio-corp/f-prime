"use client";

import { ColumnMedium } from "./ColumnMedium";
import type { ModalColumnProps } from "./modal-contracts";

/**
 * Due Media affiancati: la copertina a sinistra la rende il guscio, qui c'è il
 * secondo. Il tipo garantisce che ce ne sia esattamente uno, quindi non c'è
 * nulla da controllare a runtime.
 */
export function DoubleColumn({ item, onCursorLabel }: ModalColumnProps<"double">) {
  const [medium] = item.extraMedia;

  return (
    // Contenitore di blocco, non flex: un flex item non si allarga sull'asse
    // principale, quindi si adatterebbe alla larghezza intrinseca dell'immagine
    // invece che a quella della colonna. Un div di blocco lascia il figlio
    // `w-full` di ColumnMedium riempire davvero la colonna.
    <div className="min-h-full">
      <ColumnMedium
        item={medium}
        onCursorLabel={onCursorLabel}
        priority
        // La colonna occupa metà viewport da `nav:` (1000px) in su, tutta
        // sotto. Valore alla lettera: i media feature non leggono i custom
        // property, quindi `--breakpoint-nav` non è esprimibile qui.
        sizes="(min-width: 1000px) 50vw, 100vw"
      />
    </div>
  );
}
