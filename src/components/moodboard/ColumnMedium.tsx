"use client";

import Image from "next/image";
import { useEffect } from "react";

import type { DetailMedium } from "@/lib/moodboard/source";

import { CURSOR_HIDDEN, type CursorLabel } from "./modal-contracts";

interface ColumnMediumProps {
  item: DetailMedium;
  onCursorLabel: (label: CursorLabel) => void;
  /** Il primo Medium visibile della colonna si carica subito, gli altri pigramente. */
  priority?: boolean;
}

/**
 * Un Medium della colonna destra. Con un Link è un'ancora e il cursore dice
 * `OPEN LINK`; senza, è inerte e il cursore sparisce — mostrare `CLOSE` su
 * qualcosa che ferma il click sarebbe una promessa non mantenuta.
 */
export function ColumnMedium({ item, onCursorLabel, priority = false }: ColumnMediumProps) {
  const { media, href } = item;
  const label = href ? "OPEN LINK" : CURSOR_HIDDEN;

  // Smontare il Medium (chiusura, cambio di Tile) non deve lasciare
  // un'etichetta appesa sul cursore.
  useEffect(() => () => onCursorLabel(null), [onCursorLabel]);

  const visual =
    media.kind === "image" ? (
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 64rem) 50vw, 100vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="h-auto w-full select-none"
      />
    ) : (
      <video
        src={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.alt}
        muted
        loop
        playsInline
        autoPlay
        className="h-auto w-full select-none"
      />
    );

  const pointerProps = {
    onPointerEnter: () => onCursorLabel(label),
    onPointerLeave: () => onCursorLabel(null),
  };

  if (!href) {
    return (
      // Inerte per davvero: ferma il click, così il cursore invisibile non
      // nasconde una chiusura inattesa del modale.
      <div {...pointerProps} onClick={(event) => event.stopPropagation()} className="block">
        {visual}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...pointerProps}
      // Il click apre il Link, non chiude il modale.
      onClick={(event) => event.stopPropagation()}
      className="block"
    >
      {visual}
    </a>
  );
}
