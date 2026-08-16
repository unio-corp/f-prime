"use client";

import Image from "next/image";
import { useState } from "react";

import { useCursorLabel } from "@/hooks/useCursorLabel";
import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

import { CURSOR_HIDDEN } from "./modal-contracts";

interface ZoomMediaProps {
  media: MoodboardMedia;
  onCursorLabel: (label: string | null) => void;
  /**
   * Se vero, il click alterna `full`/`fit` come nel layout `zoom`. Se falso,
   * la copertina è statica e inerte: per dominio il Medium di griglia non
   * porta mai un Link (CONTEXT.md), quindi in `double`/`gallery` il click
   * ferma solo la propagazione, senza alternare nulla — il cursore CLOSE del
   * guscio mentirebbe lì, quindi si nasconde e riappare quello nativo.
   */
  toggleable?: boolean;
  /**
   * Se vero, limita l'altezza a `110dvh` e ritaglia con `object-fit: cover`
   * invece dell'altezza naturale — richiesto dal layout `gallery`, dove la
   * copertina condivide la viewport con una colonna destra che può scorrere
   * più a lungo di lei.
   */
  constrainHeight?: boolean;
}

/**
 * La copertina del modale.
 *
 * Quando `toggleable` (layout `zoom`), un pulsante alterna due stati al
 * click:
 * - `full` (predefinito): larghezza 100vw, altezza secondo le proporzioni.
 * - `fit`: altezza 100dvh, larghezza auto — l'intero Medium entra
 *   nell'altezza della viewport; unità dinamiche perché le barre del browser
 *   mobile non lo taglino.
 * L'etichetta del cursore nomina lo stato a cui porta il click: FIT quando è
 * a tutta larghezza, ZOOM quando è adattato.
 *
 * Quando non `toggleable` (`double`, `gallery`), resta un `div` statico e
 * inerte — nessun controllo interattivo senza un'azione reale da offrire.
 */
export function ZoomMedia({
  media,
  onCursorLabel,
  toggleable = false,
  constrainHeight = false,
}: ZoomMediaProps) {
  const [isFit, setIsFit] = useState(false);
  const showFit = toggleable && isFit;
  const label = toggleable ? (isFit ? "ZOOM" : "FIT") : CURSOR_HIDDEN;
  const pointerProps = useCursorLabel(label, onCursorLabel);

  const onClick = (event: React.MouseEvent) => {
    // Tiene il click lontano dal backdrop: non deve mai chiudere il modale.
    event.stopPropagation();
    if (toggleable) setIsFit((previous) => !previous);
  };

  const visual = (
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
          : cn("h-auto w-full", constrainHeight && "max-h-[110dvh] object-cover"),
      )}
    />
  );

  if (toggleable) {
    return (
      <button
        type="button"
        aria-label={showFit ? "Fit image to width" : "Fit image to height"}
        onClick={onClick}
        {...pointerProps}
        className={cn("block", showFit ? "mx-auto w-auto" : "w-full")}
      >
        {visual}
      </button>
    );
  }

  return (
    <div
      {...pointerProps}
      onClick={onClick}
      className="block [@media(pointer:fine)]:cursor-auto"
    >
      {visual}
    </div>
  );
}
