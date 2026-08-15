"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

interface TileMediaProps {
  media: MoodboardMedia;
  /**
   * `fill` copre la cella (Tile della griglia); `natural` rende a tutta
   * larghezza con l'altezza che segue le proporzioni del Medium.
   */
  layout?: "fill" | "natural";
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Contenitore del Medium di una Tile. I video partono da soli, sono in loop
 * e senza audio; le immagini usano `object-fit: cover`.
 */
export function TileMedia({
  media,
  layout = "fill",
  sizes = "(min-width: 1000px) 12.5vw, 25vw",
  priority = false,
  className,
}: TileMediaProps) {
  const isFill = layout === "fill";
  const videoRef = useRef<HTMLVideoElement>(null);

  // La riproduzione segue `prefers-reduced-motion`: i video si mettono in
  // pausa (e riprendono) secondo la preferenza di movimento dell'utente,
  // invece di riprodursi sempre.
  useEffect(() => {
    if (media.kind !== "video") return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPlayback = () => {
      if (mediaQuery.matches) {
        videoEl.pause();
      } else {
        void videoEl.play().catch(() => {
          // Il browser può rifiutare l'autoplay: ignoriamo, resta il poster.
        });
      }
    };

    syncPlayback();
    mediaQuery.addEventListener("change", syncPlayback);
    return () => mediaQuery.removeEventListener("change", syncPlayback);
  }, [media.kind]);

  // `fill`: il contenitore prende la dimensione dalla Tile che lo ospita e
  // la impone ai figli (h-full/w-full + overflow-hidden).
  // `natural`: il contenitore non impone nulla. Il Medium occupa la larghezza
  // disponibile e l'altezza segue le sue proporzioni, così la colonna scorre
  // invece di aggiungere bande vuote.
  const wrapperClassName = cn(
    isFill ? "relative grid h-full w-full overflow-hidden" : "w-full",
    className,
  );

  if (media.kind === "video") {
    return (
      <div className={wrapperClassName}>
        <video
          ref={videoRef}
          className={
            isFill ? "absolute top-0 left-0 h-full w-full object-cover" : "h-auto w-full"
          }
          width={isFill ? undefined : media.width}
          height={isFill ? undefined : media.height}
          src={media.src}
          poster={media.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={media.alt || undefined}
        />
      </div>
    );
  }

  if (!isFill) {
    return (
      <div className={wrapperClassName}>
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
