"use client";

import { ColumnMedium } from "./ColumnMedium";
import type { ModalColumnProps } from "./modal-contracts";

/**
 * I Media aggiuntivi impilati, senza spazio fra loro: scorrono con la pagina,
 * che nel modale è già l'unico contesto di scroll. Il tipo garantisce che ce
 * ne sia almeno uno.
 */
export function GalleryColumn({ item, onCursorLabel }: ModalColumnProps<"gallery">) {
  return (
    <div className="flex min-h-full flex-col">
      {item.extraMedia.map((medium, index) => (
        <ColumnMedium
          // La sorgente può ripetere lo stesso Medium: l'indice fa parte
          // dell'identità, e l'ordine di questa lista non cambia mai.
          key={`${medium.media.src}-${index}`}
          item={medium}
          onCursorLabel={onCursorLabel}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
