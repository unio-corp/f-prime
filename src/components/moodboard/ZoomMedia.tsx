"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

import { CURSOR_HIDDEN } from "./modal-contracts";

interface ZoomMediaProps {
  media: MoodboardMedia;
  /** Permette al guscio di etichettare il cursore mentre il puntatore è sull'immagine. */
  onCursorLabel: (label: string | null) => void;
  /**
   * Se vero, nello stato `full` la copertina riempie l'altezza della sua
   * colonna (griglia a due colonne: la riga si stira già alla cella più alta)
   * e ritaglia con `object-fit: cover`, invece di usare l'altezza naturale —
   * richiesto da `double`, dove le due immagini devono avere la stessa
   * altezza. Lo stato `fit` non è toccato: mostra sempre il Medium intero,
   * senza ritaglio, con le sue proporzioni reali.
   */
  matchHeight?: boolean;
  /**
   * Se vero, la copertina è statica: nessun toggle FIT/ZOOM, nessuna
   * etichetta sul cursore (come un `ColumnMedium` senza `href`), click comunque
   * fermato perché non deve chiudere il modale. Richiesto ovunque il modale
   * abbia una colonna destra: ingrandire la copertina lascerebbe bande
   * laterali vuote, contraddicendo la larghezza 100% della sua colonna.
   * Quando falso (il layout `zoom`, senza colonna destra), il comportamento è
   * quello originale e invariato.
   */
  isStatic?: boolean;
}

/**
 * Il Medium in zoom del modale.
 *
 * Quando `isStatic` è falso (layout `zoom`, la maggioranza delle Tile), due
 * stati alternati dal click sull'immagine:
 * - `full` (predefinito): larghezza 100vw, altezza secondo le proporzioni.
 * - `fit`: altezza 100dvh, larghezza auto — l'intero Medium entra
 *   nell'altezza della viewport; unità dinamiche perché le barre del browser
 *   mobile non lo taglino.
 * L'etichetta del cursore nomina lo stato a cui porta il click: FIT quando è
 * a tutta larghezza, ZOOM quando è adattato.
 *
 * Quando `isStatic` è vero (`double`, `gallery`: il modale ha una colonna
 * destra), il toggle è disattivato: sempre lo stato `full` — con
 * `matchHeight`, l'altezza della colonna, ritagliata — nessuna etichetta sul
 * cursore, click comunque fermato per non chiudere il modale.
 */
export function ZoomMedia({ media, onCursorLabel, matchHeight = false, isStatic = false }: ZoomMediaProps) {
  const [isFit, setIsFit] = useState(false);
  const isPointerInside = useRef(false);

  // Statica, non c'è nulla da annunciare: la stessa scelta di ColumnMedium
  // per un Medium senza href, per lo stesso motivo — un'etichetta che non
  // corrisponde a un'azione reale è un trabocchetto.
  const label = isStatic ? CURSOR_HIDDEN : isFit ? "ZOOM" : "FIT";
  const showFit = !isStatic && isFit;

  // Se lo stato cambia con il puntatore fermo, va aggiornata anche l'etichetta.
  useEffect(() => {
    if (isPointerInside.current) onCursorLabel(label);
  }, [label, onCursorLabel]);

  // Lasciare l'immagine (unmount, chiusura) non deve lasciare l'etichetta appesa.
  useEffect(() => () => onCursorLabel(null), [onCursorLabel]);

  return (
    <button
      type="button"
      aria-label={isStatic ? undefined : showFit ? "Fit image to width" : "Fit image to height"}
      onClick={(event) => {
        // Tiene il click lontano dal backdrop: non deve mai chiudere il
        // modale, che alterni lo stato (zoom) o no (statica).
        event.stopPropagation();
        if (!isStatic) setIsFit((previous) => !previous);
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        onCursorLabel(label);
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        onCursorLabel(null);
      }}
      // In `fit` il pulsante avvolge l'immagine, così le bande laterali
      // restano backdrop: chiudono il modale e mostrano il cursore CLOSE.
      // In `full` con `matchHeight`, il pulsante riempie anche l'altezza
      // della colonna (che la griglia del guscio ha già steso alla cella
      // più alta), così l'immagine dentro ha una base da riempire.
      className={cn(
        "block",
        showFit ? "mx-auto w-auto" : cn("w-full", matchHeight && "nav:h-full"),
      )}
    >
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="100vw"
        priority
        className={cn(
          "select-none",
          showFit
            ? "inline-block h-[100dvh] w-auto max-w-none"
            : cn("h-auto w-full", matchHeight && "nav:h-full nav:object-cover"),
        )}
      />
    </button>
  );
}
