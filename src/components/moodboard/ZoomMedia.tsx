"use client";

import Image from "next/image";
import { useState } from "react";

import { useCursorLabel } from "@/hooks/useCursorLabel";
import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

interface ZoomMediaProps {
  media: MoodboardMedia;
  /** Permette al guscio di etichettare il cursore mentre il puntatore è sull'immagine. */
  onCursorLabel: (label: string | null) => void;
}

/**
 * Il Medium in zoom del modale: due stati alternati dal click sull'immagine.
 * - `full` (predefinito): larghezza 100vw, altezza secondo le proporzioni.
 * - `fit`: altezza 100dvh, larghezza auto — l'intero Medium entra
 *   nell'altezza della viewport; unità dinamiche perché le barre del browser
 *   mobile non lo taglino.
 * L'etichetta del cursore nomina lo stato a cui porta il click: FIT quando è
 * a tutta larghezza, ZOOM quando è adattato.
 */
export function ZoomMedia({ media, onCursorLabel }: ZoomMediaProps) {
  const [isFit, setIsFit] = useState(false);

  const label = isFit ? "ZOOM" : "FIT";
  const showFit = isFit;
  const sizes = "100vw";
  const pointerProps = useCursorLabel(label, onCursorLabel);

  return (
    <button
      type="button"
      aria-label={showFit ? "Fit image to width" : "Fit image to height"}
      onClick={(event) => {
        // Tiene il click lontano dal backdrop: non deve mai chiudere il modale.
        event.stopPropagation();
        setIsFit((previous) => !previous);
      }}
      {...pointerProps}
      // In `fit` il pulsante avvolge l'immagine, così le bande laterali
      // restano backdrop: chiudono il modale e mostrano il cursore CLOSE.
      className={cn("block", showFit ? "mx-auto w-auto" : "w-full")}
    >
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={sizes}
        priority
        className={cn(
          "select-none",
          showFit ? "inline-block h-[100dvh] w-auto max-w-none" : "h-auto w-full",
        )}
      />
    </button>
  );
}
