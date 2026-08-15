"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons";
import type { MoodItem } from "@/lib/moodboard/source";
import { cn } from "@/lib/utils";

import { CURSOR_HIDDEN } from "./modal-contracts";
import { getLeftColumnClassName, renderRightColumn } from "./modal-layouts";
import { ZoomMedia } from "./ZoomMedia";

interface MoodModalProps {
  item: MoodItem;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Il guscio del modale: backdrop, comandi di chiusura, gestione del focus e
 * blocco dello scroll. Rende il Medium della Tile nella colonna sinistra e
 * delega la colonna destra opzionale al registro dei layout — così un nuovo
 * layout è un componente più una voce nella mappa, mai una modifica a questo
 * file.
 */
export function MoodModal({ item, onClose }: MoodModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Cursore personalizzato: ovunque fuori dal contenuto mostra CLOSE, cioè
  // ciò che farebbe un click lì. Il contenuto imposta la propria etichetta
  // tramite `setCursorLabel`.
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [contentLabel, setContentLabel] = useState<string | null>(null);
  const setCursorLabel = useCallback((label: string | null) => setContentLabel(label), []);

  const rightColumn = renderRightColumn(item, setCursorLabel);
  const leftColumnClassName = getLeftColumnClassName(item);

  useEffect(() => {
    // Catturato prima che il focus entri nel modale: è il pulsante della Tile
    // che lo ha aperto, e dove il focus torna alla chiusura.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeButtonRef.current?.focus();

    // Dissolvenza al frame successivo, così l'opacity-0 iniziale viene dipinta prima.
    const raf = requestAnimationFrame(() => setIsVisible(true));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !modalRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Blocca lo scroll della pagina compensando la larghezza della scrollbar,
    // così il contenuto dietro al modale non si sposta lateralmente.
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mood preview"
      // Il backdrop chiude al click; i click sul contenuto non arrivano fin qui.
      onClick={onClose}
      onPointerMove={(event) => setCursor({ x: event.clientX, y: event.clientY })}
      onPointerLeave={() => setCursor(null)}
      className={cn(
        "fixed inset-0 z-[9000] overflow-y-auto bg-fp-white opacity-0 transition-opacity duration-[var(--duration-fp-base)] motion-reduce:transition-none wide:bg-fp-surface",
        // L'etichetta sostituisce il cursore nativo, ma solo dove ne esiste uno.
        "[@media(pointer:fine)]:cursor-none",
        isVisible && "opacity-100",
      )}
    >
      <div className="fp-container pointer-events-none fixed inset-x-0 top-0 z-[2] grid h-15 grid-cols-[var(--spacing-fp-close)_1fr_var(--spacing-fp-close)]">
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="pointer-events-auto col-start-3 grid cursor-pointer place-items-center justify-self-end"
        >
          <CloseIcon className="size-6 text-fp-black" />
        </button>
      </div>

      {/* La griglia resta parte del backdrop: cliccare il margine attorno al
          contenuto chiude, cliccare il contenuto no. */}
      <div
        className={cn(
          "grid min-h-full grid-cols-1",
          rightColumn && "nav:grid-cols-[1fr_1fr]",
        )}
      >
        {/* Nessun padding: il Medium arriva a filo. ZoomMedia ferma il proprio
            click, così ciò che gli sta accanto resta backdrop. La classe della
            colonna sinistra arriva dal registro dei layout: il guscio non sa
            per quale layout la applica. */}
        <div className={leftColumnClassName}>
          <ZoomMedia media={item.media} onCursorLabel={setCursorLabel} />
        </div>

        {/* Nessun wrapper che fermi il click: ogni Medium della colonna decide
            da sé se il click gli appartiene o se deve chiudere il modale. */}
        {rightColumn}
      </div>

      {cursor && contentLabel !== CURSOR_HIDDEN ? (
        <span
          aria-hidden="true"
          style={{ left: cursor.x, top: cursor.y }}
          // `mix-blend-difference` sul bianco mantiene l'etichetta leggibile
          // sia sui Media chiari sia su quelli scuri.
          className="pointer-events-none fixed z-[9001] hidden -translate-x-1/2 -translate-y-1/2 font-fp-sans text-fp-cap tracking-wide text-fp-white mix-blend-difference [@media(pointer:fine)]:block"
        >
          {contentLabel ?? "CLOSE"}
        </span>
      ) : null}
    </div>
  );
}
