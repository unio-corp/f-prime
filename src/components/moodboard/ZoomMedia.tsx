"use client";

import Image from "next/image";

import { useCursorLabel } from "@/hooks/useCursorLabel";
import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

import { CURSOR_HIDDEN } from "./modal-contracts";

interface ZoomMediaProps {
  media: MoodboardMedia;
  onCursorLabel: (label: string | null) => void;
  /**
   * Se vero, limita l'altezza a `110dvh` e ritaglia con `object-fit: cover`
   * invece dell'altezza naturale — richiesto dal layout `gallery`, dove la
   * copertina condivide la viewport con una colonna destra che può scorrere
   * più a lungo di lei.
   */
  constrainHeight?: boolean;
}

/**
 * La copertina del modale: un'immagine statica a tutta larghezza. Per
 * dominio il Medium di griglia non porta mai un Link (CONTEXT.md), quindi
 * resta inerte — il click ferma la propagazione così non chiude il modale,
 * ma non fa nient'altro. Il cursore personalizzato del guscio (`CLOSE`)
 * mentirebbe qui, quindi si nasconde e riappare quello nativo del sistema.
 */
export function ZoomMedia({ media, onCursorLabel, constrainHeight = false }: ZoomMediaProps) {
  const pointerProps = useCursorLabel(CURSOR_HIDDEN, onCursorLabel);

  return (
    <div
      {...pointerProps}
      onClick={(event) => event.stopPropagation()}
      className="block [@media(pointer:fine)]:cursor-auto"
    >
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="100vw"
        priority
        className={cn(
          "h-auto w-full select-none",
          constrainHeight && "max-h-[110dvh] object-cover",
        )}
      />
    </div>
  );
}
