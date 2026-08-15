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
    <div className="flex min-h-full items-start">
      <ColumnMedium
        item={medium}
        onCursorLabel={onCursorLabel}
        priority
        // La colonna occupa metà viewport da `nav:` in su, tutta sotto.
        sizes="(min-width: 64rem) 50vw, 100vw"
      />
    </div>
  );
}
