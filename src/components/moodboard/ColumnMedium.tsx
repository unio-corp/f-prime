"use client";

import Image from "next/image";

import { useCursorLabel } from "@/hooks/useCursorLabel";
import type { DetailMedium } from "@/lib/moodboard/source";
import { cn } from "@/lib/utils";

import { CURSOR_HIDDEN, type CursorLabel } from "./modal-contracts";

interface ColumnMediumProps {
  item: DetailMedium;
  onCursorLabel: (label: CursorLabel) => void;
  /** Il primo Medium visibile della colonna si carica subito, gli altri pigramente. */
  priority?: boolean;
  /**
   * Attributo `sizes` per `next/image`, in funzione di quanta viewport occupa
   * davvero questa colonna: dichiarato dal layout chiamante (`DoubleColumn`,
   * `GalleryColumn`), non fisso qui, perché ogni layout divide la colonna
   * destra in un numero diverso di celle.
   */
  sizes: string;
  /**
   * Classe Tailwind `aspect-[…]` completa, passata alla lettera dal layout
   * chiamante (Tailwind non risolve classi ricomposte a runtime). Se
   * presente, il Medium riempie il riquadro e ritaglia con
   * `object-fit: cover` invece dell'altezza naturale — richiesto da
   * `GalleryColumn`. Assente, il Medium mantiene le sue proporzioni.
   */
  aspectClassName?: string;
  /**
   * Se vero, un Medium senza `href` mostra il cursore nativo del sistema
   * invece di nasconderlo del tutto — richiesto da `GalleryColumn`, dove le
   * celle senza Link sono affiancate a quelle con Link e "nessun cursore"
   * leggerebbe come un errore di caricamento più che come inerzia voluta.
   */
  showNativeCursorWhenInert?: boolean;
}

/**
 * Un Medium della colonna destra. Con un Link è un'ancora e il cursore dice
 * `OPEN LINK`; senza, è inerte e il cursore sparisce — mostrare `CLOSE` su
 * qualcosa che ferma il click sarebbe una promessa non mantenuta.
 */
export function ColumnMedium({
  item,
  onCursorLabel,
  priority = false,
  sizes,
  aspectClassName,
  showNativeCursorWhenInert = false,
}: ColumnMediumProps) {
  const { media, href } = item;
  const label = href ? "OPEN LINK" : CURSOR_HIDDEN;
  const visualClassName = cn(
    "select-none",
    aspectClassName ? "h-full w-full object-cover" : "h-auto w-full",
  );
  const wrapperClassName = cn("block", aspectClassName);
  const pointerProps = useCursorLabel(label, onCursorLabel);

  const visual =
    media.kind === "image" ? (
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={visualClassName}
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
        // Non prioritario: nessun preload né autoplay finché non serve.
        autoPlay={priority}
        preload={priority ? "auto" : "none"}
        className={visualClassName}
      />
    );

  if (!href) {
    return (
      // Inerte per davvero: ferma il click, così il cursore invisibile non
      // nasconde una chiusura inattesa del modale.
      <div
        {...pointerProps}
        onClick={(event) => event.stopPropagation()}
        className={cn(wrapperClassName, showNativeCursorWhenInert && "[@media(pointer:fine)]:cursor-auto")}
      >
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
      className={wrapperClassName}
    >
      {visual}
    </a>
  );
}
