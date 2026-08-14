"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { MoodboardMedia } from "@/types/moodboard";

interface TileMediaProps {
  media: MoodboardMedia;
  /** `fill` covers the cell (grid tiles); `intrinsic` keeps the aspect ratio (modal). */
  layout?: "fill" | "intrinsic";
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Media wrapper for a Tile. Videos autoplay, loop and are muted; images use
 * `object-fit: cover`.
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

  // Playback follows `prefers-reduced-motion`: videos pause (and resume)
  // with the user's motion preference rather than playing unconditionally.
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
          // Autoplay can be rejected by the browser; ignore, poster still shows.
        });
      }
    };

    syncPlayback();
    mediaQuery.addEventListener("change", syncPlayback);
    return () => mediaQuery.removeEventListener("change", syncPlayback);
  }, [media.kind]);

  // `fill`: the wrapper is sized by the grid tile it lives in, and it drives
  // that size onto its children (h-full/w-full + overflow-hidden).
  // `intrinsic`: the reverse — the wrapper must NEVER impose a size of its
  // own (no aspect-ratio box, no width-derived height). It has to fit
  // whatever the parent (e.g. a `1fr` modal grid track) hands it, bounded by
  // max-width/max-height so it never grows past that allotment and starves
  // sibling tracks. `max-h-full`/`max-w-full` here is what lets the modal's
  // `className="max-h-full"` actually bite.
  const wrapperClassName = cn(
    "relative grid h-full w-full",
    isFill ? "overflow-hidden" : "max-h-full max-w-full overflow-hidden",
    className,
  );

  if (media.kind === "video") {
    return (
      <div className={wrapperClassName}>
        <video
          ref={videoRef}
          className={cn(
            "absolute top-0 left-0 h-full w-full",
            isFill ? "object-cover" : "object-contain",
          )}
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

  return (
    <div className={wrapperClassName}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={isFill ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
