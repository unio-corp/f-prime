"use client";

import { ColumnMedium } from "./ColumnMedium";
import type { ModalColumnProps } from "./modal-contracts";

/**
 * I Media aggiuntivi in una griglia a 3 colonne, a filo, senza spaziatura fra
 * le celle: scorrono con la pagina, che nel modale è già l'unico contesto di
 * scroll. Il tipo garantisce che ce ne sia almeno uno.
 */
export function GalleryColumn({ item, onCursorLabel }: ModalColumnProps<"gallery">) {
  return (
    <div className="grid min-h-full grid-cols-3">
      {item.extraMedia.map((medium, index) => (
        <ColumnMedium
          // La sorgente può ripetere lo stesso Medium: l'indice fa parte
          // dell'identità, e l'ordine di questa lista non cambia mai.
          key={`${medium.media.src}-${index}`}
          item={medium}
          onCursorLabel={onCursorLabel}
          priority={index === 0}
          // Colonna destra a 50vw, divisa in 3: ogni cella è circa 1/6 della
          // viewport da `nav:` (1000px) in su, 1/3 sotto (colonna destra a
          // tutta larghezza). Valore alla lettera per lo stesso motivo di
          // DoubleColumn: i media feature non leggono i custom property.
          sizes="(min-width: 1000px) 16.6667vw, 33.3333vw"
        />
      ))}
    </div>
  );
}
